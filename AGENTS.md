# Agent Guide: awesome-nutrient

Curated collection of Nutrient examples, demos, and resources.
This is **not** an SDK repository.

## Start Here

Before making changes, inspect these files instead of relying on this guide as a second source of truth:

- `README.md` — top-level catalog, content taxonomy, and main entry points
- `playground/README.md` — Playground-specific organization and navigation
- The nearest category `README.md` under `web/` (or another platform folder) — local conventions and example index
- The example's own `README.md` and `package.json` — setup and run instructions
- `package.json` — repo-level scripts
- `biome.json` — formatting and linting rules
- `.github/workflows/` — CI checks
- `DISCLAIMER.md` — support expectations for this repo

Do not duplicate the contents of those files here.

## Contribution Types

Choose the right kind of contribution for the content you are adding:

| Type | Use When | Primary Location |
|------|----------|------------------|
| **Playground snippet** | Small, browser-based examples that should run instantly with no local setup | `playground/` |
| **Runnable local example** | Multi-file examples intended to be installed and run locally | Platform/category folders such as `web/` |
| **External link / catalog entry** | The canonical implementation or documentation lives in another repo or on nutrient.io | Relevant README/index file |

If unsure, prefer linking to the canonical source over creating a duplicate copy here.

## Playground Snippets

For Playground work:

- Start in `playground/README.md`
- Follow the existing category structure under `playground/`
- Update the relevant `playground/web-*.md` index file so the snippet remains discoverable
- Use `playground/package.json` and `playground/tsconfig.json` as the source of truth for validation

## Runnable Local Examples

For local examples:

- Follow the conventions already used in the folder you are editing
- Add or update the example's own `README.md` with a short description and quick start
- Update the nearest category `README.md` so the example is discoverable
- If needed, update the root `README.md` when adding a new top-level category or notable entry point
- Do **not** assume every example uses the same run script — inspect that example's `package.json`

## Contribution Rules

- Keep changes focused and easy to discover
- Update the relevant README/index whenever you add, remove, move, or rename content
- Prefer canonical links over duplicated code when appropriate
- Preserve naming and folder conventions used in the area you are editing
- Use `@nutrient-sdk/viewer` for new Web SDK examples instead of legacy `pspdfkit`
- Do not add guidance or claims that conflict with `DISCLAIMER.md`

## Validation

Before opening a PR:

- Run the relevant repo-level or example-level scripts from `package.json`
- Verify changed links and referenced paths
- Check `.github/workflows/` if CI expectations are unclear
- Run formatting via the repo's documented scripts when applicable
