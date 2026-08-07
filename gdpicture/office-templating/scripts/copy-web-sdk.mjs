/**
 * Copies the Nutrient Web SDK's distributable into wwwroot so the app can serve it.
 *
 * The SDK loads its WASM core and resource files at runtime from a `baseUrl`, so the
 * whole `nutrient-viewer-lib` folder has to sit next to the served script — it can't be
 * bundled or tree-shaken. Runs on `npm install` locally and in the Docker build.
 */

import { cp, mkdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const source = join(root, "node_modules", "@nutrient-sdk", "viewer", "dist");
const target = join(
  root,
  "src",
  "NutrientOfficeTemplating",
  "wwwroot",
  "vendor",
  "nutrient",
);

try {
  await stat(source);
} catch {
  console.error(
    `Nutrient Web SDK not found at ${source}.\nRun \`npm install\` first.`,
  );
  process.exit(1);
}

// Replace wholesale: a stale mix of versions in this folder would be very hard to debug.
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

// Only the loader and its lib folder are needed; the .d.ts is for editors, not runtime.
await cp(
  join(source, "nutrient-viewer.js"),
  join(target, "nutrient-viewer.js"),
);
await cp(
  join(source, "nutrient-viewer-lib"),
  join(target, "nutrient-viewer-lib"),
  { recursive: true },
);

console.log(`Nutrient Web SDK copied to ${target.replace(`${root}/`, "")}`);
