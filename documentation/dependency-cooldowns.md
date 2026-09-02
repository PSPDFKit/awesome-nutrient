# Dependency cooldown policy

This repository delays newly published npm packages for 15 days. The delay reduces exposure to compromised releases while the ecosystem detects and removes them.

## Supported package managers

Examples with JavaScript dependencies must use npm or pnpm and commit the matching lockfile. Yarn, Bun, and `npm-shrinkwrap.json` are not covered by the policy tooling.

Use the repository toolchain pinned in `.tool-versions` when maintaining lockfiles. npm must be 11.10.0 or newer; npm 11 itself requires Node.js `^20.17.0 || >=22.9.0`. The pinned Node.js release includes a compatible npm.

## Adding an npm example

Commit all of the following in the example directory:

- `package.json` with `engines.node: "^20.17.0 || >=22.9.0"` and `engines.npm: ">=11.10.0"`
- `.npmrc` with `min-release-age=15` and `engine-strict=true` (keys are case-sensitive and must not sit under an ini `[section]` header)
- `package-lock.json`

Do not commit `min-release-age-exclude`. If a required security release is younger than 15 days, wait for it to mature or request an explicitly reviewed policy change rather than silently bypassing the cooldown.

npm applies the cooldown only while resolving dependencies. It does not re-check a valid committed lockfile during `npm ci`, so reviewers must verify npm lockfile refreshes were performed with the pinned toolchain.

## Adding a pnpm example

In addition to its manifest and `pnpm-lock.yaml`, commit a `pnpm-workspace.yaml` containing:

```yaml
minimumReleaseAge: 21600 # 15 days in minutes
```

Pin pnpm with the `packageManager` field in `package.json`. When an example supports both npm and pnpm, keep `package.json#overrides` and `pnpm-workspace.yaml#overrides` identical.

Do not commit `minimumReleaseAgeExclude`, `minimumReleaseAgeStrict: false`, or `trustLockfile: true`. `minimumReleaseAgeStrict: false` lets pnpm fall back to a release younger than the cooldown when nothing older satisfies a range, and `trustLockfile: true` disables the frozen-lockfile cooldown verification performed in CI.

The policy check reads `pnpm-workspace.yaml` conservatively and fails closed: top-level settings must be plain, unquoted `key: value` lines. Quoted keys, anchors, aliases, tags, merge keys, block scalars, and flow-style documents are rejected rather than skipped.

## Updating dependencies

1. Use the pinned Node.js/npm and pnpm versions.
2. Run the relevant audit and apply available nonbreaking remediations.
3. Regenerate every affected lockfile with the cooldown active.
4. Run:

   ```bash
   npm run test:dependency-policy
   node .github/scripts/check-cooldown-coverage.mjs
   node .github/scripts/check-override-sync.mjs
   ```

5. For each pnpm example, verify the committed lockfile:

   ```bash
   corepack enable pnpm
   pnpm install --lockfile-only --frozen-lockfile --ignore-scripts
   ```

Audit results are point-in-time. Re-run audits immediately before merging a dependency-remediation PR that has remained open, and date any clean-audit claim.
