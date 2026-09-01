// The dependency cooldown only applies where it is configured, so every
// example that commits a lockfile must opt in: an .npmrc setting
// min-release-age (with engine-strict and an engines.npm floor so a too-old
// npm fails loudly instead of skipping the cooldown) next to each
// package-lock.json, and a pnpm-workspace.yaml setting minimumReleaseAge
// next to each pnpm-lock.yaml. Without this check, a new example silently
// opts out of the policy forever.
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const MIN_DAYS = 15;
// pnpm's minimumReleaseAge is expressed in minutes.
const MIN_MINUTES = MIN_DAYS * 24 * 60;

const excludeNodeModules = (path) => path.includes("node_modules");
const find = (pattern) =>
  globSync(pattern, { exclude: excludeNodeModules }).sort();

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(message);
};

// Only npm and pnpm lockfiles are covered by the policy tooling; any other
// lockfile type would silently bypass the cooldown entirely.
for (const pattern of [
  "**/yarn.lock",
  "**/bun.lock",
  "**/bun.lockb",
  "**/npm-shrinkwrap.json",
]) {
  for (const lockfile of find(pattern)) {
    fail(
      `${lockfile}: unsupported lockfile type; only package-lock.json and pnpm-lock.yaml are covered by the dependency cooldown policy`,
    );
  }
}

function setting(file, pattern) {
  if (!existsSync(file)) {
    return undefined;
  }
  const match = readFileSync(file, "utf8").match(pattern);
  return match ? Number(match[1]) : undefined;
}

function has(file, pattern) {
  return existsSync(file) && pattern.test(readFileSync(file, "utf8"));
}

const npmLocks = find("**/package-lock.json");
for (const lockfile of npmLocks) {
  const dir = dirname(lockfile);
  const npmrc = join(dir, ".npmrc");
  const days = setting(npmrc, /^min-release-age\s*=\s*(\d+)\s*$/m);
  if (days === undefined) {
    fail(
      `${dir}: commits a package-lock.json but has no .npmrc setting min-release-age`,
    );
  } else if (days < MIN_DAYS) {
    fail(
      `${dir}: .npmrc sets min-release-age=${days}, below the policy floor of ${MIN_DAYS}`,
    );
  }
  if (!has(npmrc, /^engine-strict\s*=\s*true\s*$/m)) {
    fail(
      `${dir}: .npmrc does not set engine-strict=true, so an npm too old for min-release-age skips the cooldown silently`,
    );
  }
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (!pkg.engines?.npm) {
    fail(
      `${dir}: package.json has no engines.npm floor for engine-strict to enforce`,
    );
  }
}

const pnpmLocks = find("**/pnpm-lock.yaml");
for (const lockfile of pnpmLocks) {
  const dir = dirname(lockfile);
  const minutes = setting(
    join(dir, "pnpm-workspace.yaml"),
    /^minimumReleaseAge:\s*(\d+)/m,
  );
  if (minutes === undefined) {
    fail(
      `${dir}: commits a pnpm-lock.yaml but has no pnpm-workspace.yaml setting minimumReleaseAge`,
    );
  } else if (minutes < MIN_MINUTES) {
    fail(
      `${dir}: pnpm-workspace.yaml sets minimumReleaseAge: ${minutes} (minutes), below the policy floor of ${MIN_MINUTES}`,
    );
  }
}

if (npmLocks.length === 0 || pnpmLocks.length === 0) {
  fail(
    `found ${npmLocks.length} package-lock.json and ${pnpmLocks.length} pnpm-lock.yaml files; glob discovery is broken (is the working directory the repository root?)`,
  );
}

if (failed) {
  process.exit(1);
}
console.log(
  `every committed lockfile (${npmLocks.length} npm, ${pnpmLocks.length} pnpm) is covered by the cooldown policy`,
);
