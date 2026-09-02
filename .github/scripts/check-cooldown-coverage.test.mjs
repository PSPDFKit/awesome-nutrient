import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkCooldownCoverage } from "./check-cooldown-coverage.mjs";

const roots = [];
const scriptDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDir, "check-cooldown-coverage.mjs");
const repoRoot = resolve(scriptDir, "../..");

function write(root, path, contents) {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function tempDir() {
  const root = mkdtempSync(join(tmpdir(), "cooldown-coverage-"));
  roots.push(root);
  return root;
}

function fixture() {
  const root = tempDir();
  write(root, "npm-example/package-lock.json", "{}");
  write(
    root,
    "npm-example/package.json",
    JSON.stringify({
      engines: { node: "^20.17.0 || >=22.9.0", npm: ">=11.10.0" },
    }),
  );
  write(root, "npm-example/.npmrc", "min-release-age=15\nengine-strict=true\n");
  write(root, "pnpm-example/pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
  write(root, "pnpm-example/pnpm-workspace.yaml", "minimumReleaseAge: 21600\n");
  return root;
}

function messages(root) {
  return checkCooldownCoverage(root).messages.join("\n");
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

test("accepts complete npm and pnpm cooldown coverage", () => {
  assert.deepEqual(checkCooldownCoverage(fixture()).messages, []);
});

test("rejects npm and pnpm cooldown escape hatches", () => {
  const root = fixture();
  write(
    root,
    "npm-example/.npmrc",
    "min-release-age=15\nengine-strict=true\nmin-release-age-exclude[]=*\n",
  );
  write(
    root,
    "pnpm-example/pnpm-workspace.yaml",
    [
      "minimumReleaseAge: 21600",
      "minimumReleaseAgeExclude:",
      "  - '*'",
      "minimumReleaseAgeStrict: false",
      "trustLockfile: true",
      "",
    ].join("\n"),
  );

  const output = messages(root);
  assert.match(output, /min-release-age-exclude bypasses the cooldown/);
  assert.match(output, /minimumReleaseAgeExclude bypasses the cooldown/);
  assert.match(output, /minimumReleaseAgeStrict: false/);
  assert.match(output, /trustLockfile: true/);
});

test("rejects duplicate npm policy keys instead of accepting the first value", () => {
  const root = fixture();
  write(
    root,
    "npm-example/.npmrc",
    [
      "min-release-age=15",
      "min-release-age=1",
      "engine-strict=true",
      "engine-strict=false",
      "",
    ].join("\n"),
  );

  const output = messages(root);
  assert.match(output, /min-release-age is set 2 times/);
  assert.match(output, /below the policy floor of 15/);
  assert.match(output, /engine-strict is set 2 times/);
  assert.match(output, /does not set engine-strict=true/);
});

test("reads .npmrc the way npm does: case-sensitive keys, bare keys, no sections", () => {
  const root = fixture();
  // npm's ini parser treats a key without "=" as true and trims whitespace.
  write(
    root,
    "npm-example/.npmrc",
    "; comment\n  min-release-age = 15  \nengine-strict\n",
  );
  assert.deepEqual(checkCooldownCoverage(root).messages, []);

  // `Min-Release-Age` is an unknown key to npm, so it must not satisfy the
  // check either.
  write(root, "npm-example/.npmrc", "Min-Release-Age=15\nEngine-Strict=true\n");
  let output = messages(root);
  assert.match(output, /no \.npmrc setting min-release-age/);
  assert.match(output, /does not set engine-strict=true/);

  // Keys below an ini section header are scoped under the section, so npm
  // would ignore them.
  write(
    root,
    "npm-example/.npmrc",
    "[cooldown]\nmin-release-age=15\nengine-strict=true\n",
  );
  output = messages(root);
  assert.match(output, /\.npmrc:1: ini section headers are not allowed/);
});

test("fails closed on pnpm-workspace.yaml syntax it cannot interpret", () => {
  const root = fixture();
  const cases = [
    ['"trustLockfile": true', /unsupported top-level YAML syntax/],
    ["'minimumReleaseAgeExclude': ['*']", /unsupported top-level YAML syntax/],
    ["<<: *defaults", /unsupported top-level YAML syntax/],
    ["- minimumReleaseAge: 21600", /unsupported top-level YAML syntax/],
    ["trustLockfile: &t true", /trustLockfile uses a YAML anchor/],
    ["trustLockfile: *t", /trustLockfile uses a YAML anchor/],
    ["trustLockfile: !!bool true", /trustLockfile uses a YAML anchor/],
    ["trustLockfile: |\n  true", /trustLockfile uses a YAML anchor/],
    [
      "trustLockfile: yes",
      /trustLockfile: yes skips the cooldown verification/,
    ],
    [
      "minimumReleaseAgeStrict: no",
      /minimumReleaseAgeStrict: no lets pnpm fall back/,
    ],
  ];
  for (const [snippet, expected] of cases) {
    write(
      root,
      "pnpm-example/pnpm-workspace.yaml",
      `minimumReleaseAge: 21600\n${snippet}\n`,
    );
    assert.match(messages(root), expected, snippet);
  }

  // A flow-style document defines no settings this check can see.
  write(
    root,
    "pnpm-example/pnpm-workspace.yaml",
    "{minimumReleaseAge: 21600, trustLockfile: true}\n",
  );
  const output = messages(root);
  assert.match(output, /unsupported top-level YAML syntax/);
  assert.match(output, /no pnpm-workspace\.yaml setting minimumReleaseAge/);
});

test("accepts the plain YAML the dual-manager examples commit", () => {
  const root = fixture();
  write(
    root,
    "pnpm-example/pnpm-workspace.yaml",
    [
      "---",
      "# workspace settings",
      "packages:",
      "  - .",
      "minimumReleaseAge: 21600 # 15 days",
      "minimumReleaseAgeStrict: true",
      "trustLockfile: false",
      "overrides:",
      '  "dompurify@<3.4.13": ">=3.4.13 <4"',
      "",
    ].join("\n"),
  );
  assert.deepEqual(checkCooldownCoverage(root).messages, []);
});

test("requires engines.npm to exclude unsupported npm versions", () => {
  const root = fixture();
  write(
    root,
    "npm-example/package.json",
    JSON.stringify({
      engines: { node: "^20.17.0 || >=22.9.0", npm: ">=1" },
    }),
  );

  assert.match(messages(root), /floor of at least >=11\.10\.0/);
});

test("requires the Node runtime range supported by npm 11", () => {
  const root = fixture();
  write(
    root,
    "npm-example/package.json",
    JSON.stringify({ engines: { node: ">=24.14.1", npm: ">=11.10.0" } }),
  );

  assert.match(messages(root), /engines\.node must be/);
});

test("aggregates missing and malformed package manifests with pnpm violations", () => {
  const root = fixture();
  rmSync(join(root, "npm-example/package.json"));
  write(root, "broken/package-lock.json", "{}");
  write(root, "broken/package.json", "{");
  write(root, "broken/.npmrc", "min-release-age=15\nengine-strict=true\n");
  write(root, "pnpm-example/pnpm-workspace.yaml", "minimumReleaseAge: 1\n");

  const output = messages(root);
  assert.match(
    output,
    /npm-example: commits a package-lock\.json but has no package\.json/,
  );
  assert.match(output, /broken: package\.json is not valid JSON/);
  assert.match(output, /below the policy floor of 21600/);
});

test("CLI discovers the full repository even when launched from a subdirectory", () => {
  const { npmLocks, pnpmLocks } = checkCooldownCoverage(repoRoot);
  assert.ok(npmLocks.length > 0 && pnpmLocks.length > 0);

  const output = execFileSync(process.execPath, [scriptPath], {
    cwd: join(repoRoot, "web"),
    encoding: "utf8",
  });
  assert.equal(
    output.trim(),
    `every committed lockfile (${npmLocks.length} npm, ${pnpmLocks.length} pnpm) is covered by the cooldown policy`,
  );
});

test("CLI runs when launched through a symlinked checkout path", () => {
  const root = tempDir();
  const link = join(root, "checkout");
  symlinkSync(repoRoot, link, "dir");

  const output = execFileSync(
    process.execPath,
    [join(link, ".github/scripts/check-cooldown-coverage.mjs")],
    { cwd: root, encoding: "utf8" },
  );
  assert.match(output, /^every committed lockfile \(\d+ npm, \d+ pnpm\)/);
});
