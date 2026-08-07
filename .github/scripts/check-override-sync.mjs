// npm and pnpm each read their own override map (package.json#overrides vs
// pnpm-workspace.yaml#overrides), so the dual-manager examples must keep the
// two maps identical by hand. This check fails when they (or the committed
// pnpm-lock.yaml overrides header) drift apart.
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// A dual-manager example is any directory (outside node_modules) that commits
// both an npm and a pnpm lockfile.
const EXAMPLES = globSync("**/pnpm-lock.yaml", {
  ignore: "**/node_modules/**",
})
  .map((lockfile) => dirname(lockfile))
  .filter((dir) => existsSync(join(dir, "package-lock.json")))
  .sort();

if (EXAMPLES.length === 0) {
  console.error("no dual-manager examples found; glob discovery is broken");
  process.exit(1);
}

// Minimal parser for the flat `overrides:` block used in these files. Keys and
// values may be quoted; the block ends at the first non-indented line.
function yamlOverrides(text) {
  const overrides = {};
  let inBlock = false;
  for (const line of text.split("\n")) {
    if (/^overrides:/.test(line)) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^[^ #]/.test(line)) {
      break;
    }
    if (inBlock) {
      const match = line.match(/^ {2}(["']?)(.+?)\1:\s*(.+)$/);
      if (match) {
        overrides[match[2]] = match[3].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return overrides;
}

function normalize(map) {
  return Object.entries(map)
    .map(([key, value]) => `${key} => ${value}`)
    .sort();
}

function report(label, expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((rule) => !actualSet.has(rule));
  const extra = actual.filter((rule) => !expectedSet.has(rule));
  console.error(`  ${label}:`);
  for (const rule of missing) {
    console.error(`    missing: ${rule}`);
  }
  for (const rule of extra) {
    console.error(`    extra:   ${rule}`);
  }
}

let failed = false;
for (const example of EXAMPLES) {
  const pkg = JSON.parse(readFileSync(join(example, "package.json"), "utf8"));
  if (pkg.pnpm) {
    failed = true;
    console.error(
      `${example}: package.json has a "pnpm" block, which pnpm 11 ignores; move it to pnpm-workspace.yaml`,
    );
  }
  const workspacePath = join(example, "pnpm-workspace.yaml");
  if (!existsSync(workspacePath)) {
    failed = true;
    console.error(
      `${example}: commits both lockfiles but has no pnpm-workspace.yaml to mirror package.json#overrides into`,
    );
    continue;
  }
  const npmRules = normalize(pkg.overrides ?? {});
  const workspaceRules = normalize(
    yamlOverrides(readFileSync(workspacePath, "utf8")),
  );
  const lockRules = normalize(
    yamlOverrides(readFileSync(join(example, "pnpm-lock.yaml"), "utf8")),
  );

  const npmJoined = JSON.stringify(npmRules);
  const problems = [];
  if (JSON.stringify(workspaceRules) !== npmJoined) {
    problems.push([
      "pnpm-workspace.yaml vs package.json",
      npmRules,
      workspaceRules,
    ]);
  }
  if (JSON.stringify(lockRules) !== npmJoined) {
    problems.push(["pnpm-lock.yaml vs package.json", npmRules, lockRules]);
  }

  if (problems.length === 0) {
    console.log(`${example}: ${npmRules.length} override rules in sync`);
  } else {
    failed = true;
    console.error(`${example}: override maps drifted`);
    for (const [label, expected, actual] of problems) {
      report(label, expected, actual);
    }
  }
}

process.exit(failed ? 1 : 0);
