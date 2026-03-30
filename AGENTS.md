# Agent Guide: awesome-nutrient

Curated collection of Nutrient SDK examples, demos, and resources.
This is **not** an SDK — it's showcase and educational content.

## Repository Structure

```
awesome-nutrient/
├── web/                        # Local runnable Web SDK examples
│   ├── annotation/             #   Annotation demos (comment, clipboard, watermark…)
│   ├── signing/                #   Signing demos (digital signatures, sign-here…)
│   ├── document-editor/        #   Page manipulation demos
│   ├── document-generator-vanillajs/  # Document Authoring SDK generator
│   ├── viewer/                 #   Multi-tab viewer
│   ├── ui-customization/       #   Baseline UI customization
│   ├── ui-customization-doc-editor-sidebar/
│   └── miscellaneous/          #   Analytics integrations
├── playground/                 # Interactive Playground snippets
│   ├── annotations/            #   Snippet folders (TypeScript + MDX)
│   ├── comments/
│   ├── content-editor/
│   ├── document-editor/
│   ├── form-creator/
│   ├── forms/
│   ├── redaction/
│   ├── signatures/
│   ├── text-comparison/
│   ├── toolbar-menus/
│   ├── viewer/
│   ├── shared/                 #   Shared utilities for snippets
│   ├── types/                  #   TypeScript type definitions
│   └── web-*.md                #   Category index files with Playground URLs
├── dws/                        # Document Web Services example (React + Vite)
├── document-engine/            # Deployment examples (Terraform, Kubernetes)
├── document-authoring/         # Document Authoring SDK examples
├── gdpicture/                  # GdPicture examples (.NET)
├── android/                    # Android examples (placeholder)
├── ios/                        # iOS examples (placeholder)
├── windows/                    # Windows WinUI3 example
└── README.md                   # Main index linking to everything
```

## Content Types

Choose the right format for your contribution:

| Type | When to Use | Location |
|------|------------|----------|
| **Playground snippet** | Small, single-feature demos (<100 lines). Runs in the browser with zero setup. | `playground/<category>/<name>/` |
| **Local example** | Multi-file projects that need `npm install`. More complex demos. | `web/<category>/<name>/` |
| **External link** | References to other repos, docs, or third-party integrations. | `README.md` |

## Adding a Playground Snippet

Each snippet lives in `playground/<category>/<snippet-name>/` with two files:

1. **`index.ts`** — The TypeScript code that runs in the Playground
2. **`playground.mdx`** — MDX file with metadata and description

After creating the snippet folder:
- Add an entry in the corresponding `playground/web-<category>.md` index file
- The entry should include a Playground URL with the base64-encoded snippet

## Adding a Local Web Example

1. Create `web/<category>/<example-name>/`
2. Include at minimum:
   - `package.json` with a `start` script
   - `index.html`
   - `index.js` (or `index.ts`)
   - A sample PDF if needed (`document.pdf`)
3. Add a `README.md` in the example folder with description and quick start
4. Add an entry in `web/<category>/README.md`
5. If it's a new category, add it to the root `README.md`

## Commands

```bash
# Install dependencies (root — formatter + linting)
npm install

# Format all code with Biome
npm run format

# Run lint-staged checks (runs automatically on commit via Husky)
npm run lint-staged
```

## Code Style

- **Biome** handles formatting and linting. Run `npm run format` before committing.
- Husky pre-commit hook runs `lint-staged` automatically.
- CI runs Biome checks on every push and PR.

## Rules

- All code must pass Biome formatting
- Every local example must have a working `npm start`
- Keep README sections ordered by category
- Don't duplicate content — a feature should be either a playground snippet OR a local example, not both
- Use `@nutrient-sdk/viewer` (not legacy `pspdfkit`) for new Web SDK examples
- Include a `README.md` with description and quick-start instructions in every example folder

## CI

- **Biome** (`byome.yml`) — Code formatting and lint checks
- **Typecheck** (`typecheck.yml`) — TypeScript validation for playground snippets
