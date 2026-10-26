import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";

test("Baseline tokens can load its Zod v4 validation error adapter", async () => {
  const require = createRequire(import.meta.url);
  const tokensEntry = require.resolve("@baseline-ui/tokens");
  const tokensRequire = createRequire(tokensEntry);
  const adapterUrl = pathToFileURL(
    tokensRequire.resolve("zod-validation-error/v4"),
  );
  const validation = await import(adapterUrl.href);
  assert.equal(typeof validation.fromError, "function");
});
