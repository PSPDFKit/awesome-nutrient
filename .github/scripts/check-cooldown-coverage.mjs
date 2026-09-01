// The dependency cooldown only applies where it is configured, so every
// example that commits a lockfile must opt in: an .npmrc with
// min-release-age next to each package-lock.json, and a pnpm-workspace.yaml
// with minimumReleaseAge next to each pnpm-lock.yaml. Without this check, a
// new example silently opts out of the policy forever.
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const excludeNodeModules = (path) => path.includes("node_modules");

function has(file, pattern) {
  return existsSync(file) && pattern.test(readFileSync(file, "utf8"));
}

let failed = false;

for (const lockfile of globSync("**/package-lock.json", {
  exclude: excludeNodeModules,
}).sort()) {
  const dir = dirname(lockfile);
  if (!has(join(dir, ".npmrc"), /^min-release-age=\d+$/m)) {
    failed = true;
    console.error(
      `${dir}: commits a package-lock.json but has no .npmrc setting min-release-age`,
    );
  }
}

for (const lockfile of globSync("**/pnpm-lock.yaml", {
  exclude: excludeNodeModules,
}).sort()) {
  const dir = dirname(lockfile);
  if (!has(join(dir, "pnpm-workspace.yaml"), /^minimumReleaseAge:\s*\d+/m)) {
    failed = true;
    console.error(
      `${dir}: commits a pnpm-lock.yaml but has no pnpm-workspace.yaml setting minimumReleaseAge`,
    );
  }
}

if (failed) {
  process.exit(1);
}
console.log("every committed lockfile is covered by the cooldown policy");
