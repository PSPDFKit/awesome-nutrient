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

Do not commit `min-release-age-exclude`. npm matches exclusions by package name rather than version, so a reviewed security release younger than 15 days must be resolved with one-time CLI flags for only the approved names; never persist those flags in `.npmrc` or lower the cooldown.

### Temporary security-release exception

The reviewed releases below fix [Next.js RCE](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [DOMPurify XSS](https://github.com/advisories/GHSA-cg2g-xh64-v4q7), and [markdown-it denial of service](https://github.com/advisories/GHSA-gfr2-rv44-r23c) advisories before their cooldown elapsed:

- `next@16.4.1`, with its exact `@next/env@16.4.1` and eight literal `@next/swc-*` platform companions at `16.4.1`
- `dompurify@3.4.17`
- `markdown-it@14.3.3`

For npm lockfile regeneration only, pass one `--min-release-age-exclude=<package-name>` flag for each necessary reviewed name. Keep the exact `next` manifest pin and the exact DOMPurify/markdown-it overrides. Do not use an exclusion range, wildcard, alias, or persisted npm setting.

npm applies the cooldown only while resolving dependencies. It does not re-check a valid committed lockfile during `npm ci`, so reviewers must verify npm lockfile refreshes were performed with the pinned toolchain.

## Adding a pnpm example

In addition to its manifest and `pnpm-lock.yaml`, commit a `pnpm-workspace.yaml` containing:

```yaml
minimumReleaseAge: 21600 # 15 days in minutes
```

Pin pnpm with the `packageManager` field in `package.json`. When an example supports both npm and pnpm, keep `package.json#overrides` and `pnpm-workspace.yaml#overrides` identical.

Do not commit `minimumReleaseAgeStrict: false` or `trustLockfile: true`. `minimumReleaseAgeStrict: false` lets pnpm fall back to a release younger than the cooldown when nothing older satisfies a range, and `trustLockfile: true` disables the frozen-lockfile cooldown verification performed in CI.

For the temporary security-release exception above, pnpm workspaces may use `minimumReleaseAgeExclude` only as a single inline JSON array of the reviewed exact `name@version` strings. The policy checker rejects every other selector, including bare names, ranges, aliases, wildcards, duplicate values, and YAML block values. Remove these exact entries after all of the releases mature; the final one, `markdown-it@14.3.3`, matures on **2026-10-31 UTC**.

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
