// The dependency cooldown only applies where it is configured, so every
// example that commits a lockfile must opt in: an .npmrc setting
// min-release-age (with engine-strict and an engines.npm floor so a too-old
// npm fails loudly instead of skipping the cooldown) next to each
// package-lock.json, and a pnpm-workspace.yaml setting minimumReleaseAge
// next to each pnpm-lock.yaml. Without this check, a new example silently
// opts out of the policy forever.
import { existsSync, globSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MIN_DAYS = 15;
const MIN_NPM_VERSION = [11, 10, 0];
// npm 11 supports these Node release lines. Keep the user-facing Node guard
// aligned with npm's own runtime requirement rather than forcing Node 24.
const REQUIRED_NODE_RANGE = "^20.17.0 || >=22.9.0";
// pnpm's minimumReleaseAge is expressed in minutes.
const MIN_MINUTES = MIN_DAYS * 24 * 60;
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(SCRIPT_PATH), "../..");

const excludeNodeModules = (path) => path.includes("node_modules");
const find = (root, pattern) =>
  globSync(pattern, { cwd: root, exclude: excludeNodeModules }).sort();

// Both config readers below are deliberately narrower than npm's ini parser
// and pnpm's YAML parser, and they fail closed: syntax they cannot map onto a
// plain `key=value` / `key: value` line is reported instead of skipped, so a
// setting the package manager would honour can never be one this check
// overlooks.
function npmrcSettings(file, label, fail) {
  const settings = new Map();
  if (!existsSync(file)) {
    return settings;
  }

  const lines = readFileSync(file, "utf8").split("\n");
  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }
    // An ini section header scopes every key below it under the section, so
    // npm would read `min-release-age` written there as an unrelated key.
    if (line.startsWith("[")) {
      fail(
        `${label}:${index + 1}: ini section headers are not allowed; npm would scope the settings below ${line} under the section and skip the cooldown`,
      );
      continue;
    }
    // npm keys are case-sensitive (`Min-Release-Age` is an unknown key), so
    // the key is kept verbatim. A key without "=" is true, as in npm's parser.
    const separator = line.indexOf("=");
    const key = separator === -1 ? line : line.slice(0, separator).trim();
    const value = separator === -1 ? "true" : line.slice(separator + 1).trim();
    const entries = settings.get(key) ?? [];
    entries.push(value);
    settings.set(key, entries);
  }
  return settings;
}

const YAML_DOCUMENT_MARKER = /^(---|\.\.\.)(\s.*)?$/;
const YAML_TOP_LEVEL_KEY = /^([A-Za-z][A-Za-z0-9]*)\s*:(?:\s+(.*))?$/;

function yamlSettings(file, label, fail) {
  const settings = new Map();
  if (!existsSync(file)) {
    return settings;
  }

  const lines = readFileSync(file, "utf8").split("\n");
  for (const [index, line] of lines.entries()) {
    // Indented lines are nested content and cannot define a top-level
    // setting; blank lines, comments and document markers carry none either.
    if (
      /^(\s|$)/.test(line) ||
      line.startsWith("#") ||
      YAML_DOCUMENT_MARKER.test(line)
    ) {
      continue;
    }
    const match = line.match(YAML_TOP_LEVEL_KEY);
    if (!match) {
      fail(
        `${label}:${index + 1}: unsupported top-level YAML syntax ${JSON.stringify(line)}; write settings as plain unquoted "key: value" lines so the policy check can read them`,
      );
      continue;
    }
    const value = (match[2] ?? "").replace(/\s+#.*$/, "").trim();
    // Anchors, aliases, tags and block scalars change how pnpm reads the
    // value; this check does not interpret them, so it refuses them.
    if (/^[&*!|>]/.test(value)) {
      fail(
        `${label}:${index + 1}: ${match[1]} uses a YAML anchor, alias, tag or block scalar; write the value as a plain scalar`,
      );
      continue;
    }
    const entries = settings.get(match[1]) ?? [];
    entries.push(value.replace(/^(["'])(.*)\1$/, "$2"));
    settings.set(match[1], entries);
  }
  return settings;
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

function npmFloor(range) {
  if (typeof range !== "string") {
    return undefined;
  }
  // Keep this deliberately narrow: every example must declare one unambiguous
  // inclusive floor, rather than a union that could also admit older npm.
  const match = range.match(/^>=\s*(\d+)\.(\d+)\.(\d+)$/);
  return match ? match.slice(1).map(Number) : undefined;
}

function readPackage(file, dir, fail) {
  if (!existsSync(file)) {
    fail(`${dir}: commits a package-lock.json but has no package.json`);
    return undefined;
  }
  try {
    const pkg = JSON.parse(readFileSync(file, "utf8"));
    if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
      fail(`${dir}: package.json must contain a JSON object`);
      return undefined;
    }
    return pkg;
  } catch (error) {
    fail(`${dir}: package.json is not valid JSON (${error.message})`);
    return undefined;
  }
}

function oneSetting(settings, key, fileLabel, fail) {
  const values = settings.get(key) ?? [];
  if (values.length > 1) {
    fail(
      `${fileLabel}: ${key} is set ${values.length} times; duplicate policy keys are ambiguous and are not allowed`,
    );
  }
  return values.at(-1);
}

export function checkCooldownCoverage(root = REPO_ROOT) {
  const messages = [];
  const fail = (message) => messages.push(message);

  // Only npm and pnpm lockfiles are covered by the policy tooling; any other
  // lockfile type would silently bypass the cooldown entirely.
  for (const pattern of [
    "**/yarn.lock",
    "**/bun.lock",
    "**/bun.lockb",
    "**/npm-shrinkwrap.json",
  ]) {
    for (const lockfile of find(root, pattern)) {
      fail(
        `${lockfile}: unsupported lockfile type; only package-lock.json and pnpm-lock.yaml are covered by the dependency cooldown policy`,
      );
    }
  }

  const npmLocks = find(root, "**/package-lock.json");
  for (const lockfile of npmLocks) {
    const dir = dirname(lockfile);
    const npmrc = join(root, dir, ".npmrc");
    const npmrcLabel = join(dir, ".npmrc");
    const settings = npmrcSettings(npmrc, npmrcLabel, fail);

    const daysValue = oneSetting(settings, "min-release-age", npmrcLabel, fail);
    if (daysValue === undefined) {
      fail(
        `${dir}: commits a package-lock.json but has no .npmrc setting min-release-age`,
      );
    } else if (!/^\d+$/.test(daysValue)) {
      fail(`${npmrcLabel}: min-release-age must be an integer`);
    } else if (Number(daysValue) < MIN_DAYS) {
      fail(
        `${dir}: .npmrc sets min-release-age=${daysValue}, below the policy floor of ${MIN_DAYS}`,
      );
    }

    const engineStrict = oneSetting(
      settings,
      "engine-strict",
      npmrcLabel,
      fail,
    );
    if (engineStrict?.toLowerCase() !== "true") {
      fail(
        `${dir}: .npmrc does not set engine-strict=true, so an npm too old for min-release-age skips the cooldown silently`,
      );
    }

    const npmExclusions = [...settings.entries()]
      .filter(
        ([key]) =>
          key === "min-release-age-exclude" ||
          key.startsWith("min-release-age-exclude["),
      )
      .flatMap(([, values]) => values);
    if (npmExclusions.length > 0) {
      fail(
        `${npmrcLabel}: min-release-age-exclude bypasses the cooldown; wait for the release to mature instead of committing an exclusion`,
      );
    }

    const pkg = readPackage(join(root, dir, "package.json"), dir, fail);
    if (pkg) {
      const floor = npmFloor(pkg.engines?.npm);
      if (!floor || compareVersions(floor, MIN_NPM_VERSION) < 0) {
        fail(
          `${dir}: package.json engines.npm must be an unambiguous floor of at least >=${MIN_NPM_VERSION.join(".")}`,
        );
      }
      if (pkg.engines?.node !== REQUIRED_NODE_RANGE) {
        fail(
          `${dir}: package.json engines.node must be ${JSON.stringify(REQUIRED_NODE_RANGE)} so users get the npm 11 runtime requirement before install`,
        );
      }
    }
  }

  const pnpmLocks = find(root, "**/pnpm-lock.yaml");
  for (const lockfile of pnpmLocks) {
    const dir = dirname(lockfile);
    const workspace = join(root, dir, "pnpm-workspace.yaml");
    const workspaceLabel = join(dir, "pnpm-workspace.yaml");
    const settings = yamlSettings(workspace, workspaceLabel, fail);
    const minutesValue = oneSetting(
      settings,
      "minimumReleaseAge",
      workspaceLabel,
      fail,
    );
    if (minutesValue === undefined) {
      fail(
        `${dir}: commits a pnpm-lock.yaml but has no pnpm-workspace.yaml setting minimumReleaseAge`,
      );
    } else if (!/^\d+$/.test(minutesValue)) {
      fail(`${workspaceLabel}: minimumReleaseAge must be an integer`);
    } else if (Number(minutesValue) < MIN_MINUTES) {
      fail(
        `${dir}: pnpm-workspace.yaml sets minimumReleaseAge: ${minutesValue} (minutes), below the policy floor of ${MIN_MINUTES}`,
      );
    }

    if (settings.has("minimumReleaseAgeExclude")) {
      fail(
        `${workspaceLabel}: minimumReleaseAgeExclude bypasses the cooldown; wait for the release to mature instead of committing an exclusion`,
      );
    }
    // pnpm defaults minimumReleaseAgeStrict to true once minimumReleaseAge is
    // set; any other value lets it fall back to an immature release, and any
    // trustLockfile value other than false skips the lockfile re-check CI
    // relies on. Only the safe literal is accepted, so `yes`, anchors and the
    // like cannot slip through as "not exactly false/true".
    const strict = oneSetting(
      settings,
      "minimumReleaseAgeStrict",
      workspaceLabel,
      fail,
    );
    if (strict !== undefined && strict.toLowerCase() !== "true") {
      fail(
        `${workspaceLabel}: minimumReleaseAgeStrict: ${strict} lets pnpm fall back to a release younger than minimumReleaseAge when no older version satisfies a range; leave it unset`,
      );
    }
    const trust = oneSetting(settings, "trustLockfile", workspaceLabel, fail);
    if (trust !== undefined && trust.toLowerCase() !== "false") {
      fail(
        `${workspaceLabel}: trustLockfile: ${trust} skips the cooldown verification of committed lockfile entries that CI relies on; leave it unset`,
      );
    }
  }

  if (npmLocks.length === 0 || pnpmLocks.length === 0) {
    fail(
      `found ${npmLocks.length} package-lock.json and ${pnpmLocks.length} pnpm-lock.yaml files; lockfile discovery is broken`,
    );
  }

  return { messages, npmLocks, pnpmLocks };
}

// Node resolves symlinks in the entry module's URL but not in process.argv[1],
// so both sides are canonicalised; comparing the raw paths made the CLI a
// silent no-op (exit 0) when launched through a symlinked checkout path.
function isMainModule() {
  try {
    return (
      realpathSync(resolve(process.argv[1] ?? "")) === realpathSync(SCRIPT_PATH)
    );
  } catch {
    return false;
  }
}

if (isMainModule()) {
  const { messages, npmLocks, pnpmLocks } = checkCooldownCoverage();
  for (const message of messages) {
    console.error(message);
  }
  if (messages.length > 0) {
    process.exit(1);
  }
  console.log(
    `every committed lockfile (${npmLocks.length} npm, ${pnpmLocks.length} pnpm) is covered by the cooldown policy`,
  );
}
