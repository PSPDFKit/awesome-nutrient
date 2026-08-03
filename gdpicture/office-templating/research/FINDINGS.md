# nutrient-office-templating — Research Findings

Source material processed for the showcase web app. Everything below is verified from
primary sources (the guide, PR #2959 branch `costinel/NAT-559`, and the reference app).

## 1. The templating API is format-neutral

The single most important finding: **DOCX, XLSX and PPTX all use the exact same API.**
Per the PR description, the engine (`GdPictureOfficeTemplater` / `OfficeTemplatingSession`)
is already format-neutral — PR #2959 is a *packaging* gap, not an engine change.

The four-call workflow is identical for all three formats:

```csharp
using GdPicture14;

LicenseManager license = new LicenseManager();
license.RegisterKEY("");                 // license key

GdPictureOfficeTemplater templater = new GdPictureOfficeTemplater();
templater.SetTemplate(File.ReadAllText("model.json"));   // JSON data model
templater.LoadFromFile("input.pptx");                    // .docx | .xlsx | .pptx
templater.Process();                                     // resolve placeholders + loops
templater.SaveToFile("output.pptx");
```

Optional PDF conversion (same for all formats):

```csharp
using GdPictureDocumentConverter converter = new GdPictureDocumentConverter();
converter.LoadFromFile("output.pptx");
converter.SaveAsPDF("output.pdf", PdfConformance.PDF_UA_1);
```

`LoadFromFile` auto-detects the format. This means **one generation code path** serves all
three showcase tabs — the only thing that varies is the template file and the JSON model.

### Higher-level editor API (from the PR)

PR #2959 adds `PresentationEditor` and `SpreadsheetEditor` to `NativeSDK.API`, mirroring the
existing `WordEditor`. They expose `ApplyTemplateModel(Stream|string)` and
`SaveWithModelAs(Stream|string)`, and work on streams — better suited to a web app than the
file-based `GdPictureOfficeTemplater`. Note these are **unreleased** (PR still OPEN), so the
demo should target the public `GdPictureOfficeTemplater` API and use `MemoryStream` +
`LoadFromStream`/`SaveToStream` where available.

Licensing note: `SaveWithModelAs` calls
`License.EvaluateFeature(License.NativeSdkFeatures.OfficeTemplatingApi)` — Office templating
is a separately licensed feature.

## 2. Template placeholder syntax (verified from the actual template files)

JSON model envelope — `config` + `model`, delimiters are configurable:

```json
{
  "config": { "delimiter": { "start": "{{", "end": "}}" } },
  "model": { "...": "..." }
}
```

| Syntax | Meaning | Verified in |
|---|---|---|
| `{{field}}` | scalar replacement | all three |
| `{{nested.field}}` | dotted path (e.g. `{{company.name}}`) | XLSX |
| `{{#loop}}...{{/loop}}` | repeat section over an array | PPTX, XLSX |
| `{{^cond}}...{{/cond}}` | inverted / false block | DOCX guide |
| `{{%field}}` | **image insertion** | PPTX (`{{%photo}}`) |

Image model shape (from `presentation_model.json`):

```json
"photo": { "_type": "image", "source": "base64", "format": "png", "data": "iVBORw0..." }
```

This is Mustache/Handlebars-like, which is great for the demo: users already recognize it.

## 3. The two fixtures from PR #2959 (saved in `research/assets/`)

### PPTX — CV / résumé, 3 slides
- `input_presentation.pptx` (7 KB), `presentation_model.json` (4.4 KB)
- slide1: `{{%photo}}`, `{{fullName}}`, `{{jobTitle}}`, `{{email}}`, `{{phone}}`, `{{location}}`, `{{summary}}`
- slide2: `{{#experience}}` loop → `{{role}}`, `{{company}}`, `{{period}}`, `{{description}}`
- slide3: `{{#skills}}` loop → `{{name}}`; `{{#education}}` loop → `{{degree}}`, `{{school}}`, `{{year}}`
- Demonstrates: loops *across slides*, and base64 image injection.

### XLSX — invoice, 1 sheet
- `input_spreadsheet.xlsx` (15.8 KB), `spreadsheet_model.json` (1.3 KB)
- Nested paths: `{{company.name}}`, `{{company.address}}`, `{{client.email}}`, …
- Row loop spans two cells: `H16` = `{{#lineItems}}{{item}}` … `G17` = `{{amount}}{{/lineItems}}`
- Totals: `{{subtotal}}`, `{{discount}}`, `{{taxRate}}`, `{{tax}}`, `{{total}}`
- Demonstrates: row expansion, nested objects, cell-type preservation (numbers/dates/%).

**DOCX has no equivalent small fixture** — the repo's `input.docx` is 1.85 MB and unrelated.
We need to author our own DOCX template (invoice/contract/report). This is fine and expected
per the brief ("find public domain or create our own").

## 4. Multi-step flow to replicate (from `document-generator-vanillajs`)

The reference app is a **5-step wizard**, and its valuable idea is that the user can edit at
every stage and move back and forth with **state preserved**:

1. Select Template → 2. Edit Template → 3. Prepare JSON Data → 4. Edit Generated DOCX → 5. Final PDF

Mechanics worth carrying over (code is irrelevant — it was Web SDK/JS):
- One `<section>` per step; `data-initialized="yes|no"` so each step initializes exactly once.
- `go<Section>()` transition functions; the visible section is the current one.
- A blocking transition overlay via `startTransition(msg)` / `endTransitionTo(section)`.
- Editors/viewers are destroyed when leaving a step to avoid wasting resources.
- Central `APP` state object holding the template, data JSON, generated doc, and PDF.

**Adaptation for our .NET app:** steps 2 and 4 (in-browser *editing* of the template and of
the generated document) depended on the Document Authoring SDK, which we are not using. Our
natural shape is:

1. **Pick format & template** (DOCX / XLSX / PPTX)
2. **Inspect the template** (show placeholders/structure, offer template download)
3. **Edit the JSON data model** (CodeMirror-style editor, pre-filled with sample data)
4. **Generate** (server-side .NET call; show the resulting Office file)
5. **Preview & download** (Office file + optional PDF/UA conversion)

Step 3 is where the real interactivity lives, and generation happens server-side.

## 5. Deployment / hosting notes (Fly.io)

- NuGet: **`GdPicture.API`** (currently 14.4.2) — also a `GdPicture` package. Cross-platform:
  Linux x64/ARM64, macOS, Windows; .NET 6+/Core/Framework.
- The PR's `docker-dotnet/Dockerfile` is the reference for a Linux container:
  - base `mcr.microsoft.com/dotnet/sdk:10.0`
  - **critical**: enables Debian `contrib non-free`, accepts the EULA, installs
    `ttf-mscorefonts-installer` + `fontconfig` — without MS core fonts, Office→PDF rendering
    substitutes fonts and output fidelity breaks.
  - sets `locale-gen en_US.UTF-8`
  - `docker-compose.yml` pins `platform: linux/amd64`
- For Fly.io: use a multi-stage build (SDK → aspnet runtime), keep the fonts + fontconfig +
  locale steps in the runtime stage, and target `linux/amd64`.
- **License key must be an env var / Fly secret**, never committed.

## 6. UI: Nutrient Design Kit

Provided as `nutrient-design-kit.zip`, extracted to `nutrient-design-kit/`. Framework-agnostic
CSS, no build step, no dependencies (~1,400 lines). Dark-mode-first.

- **Install:** one link — `css/nutrient-kit.css` (bundles font → tokens → reset → components,
  in that order). Optional `tokens-light.css` + `<html data-theme="dark|light">` for a toggle.
- **One required edit:** the font URL inside `css/font.css`.
- **Classes** are `nk-` namespaced, modifiers `--`, states via ARIA (`aria-selected`,
  `aria-pressed`) rather than classes.
- **Reference:** `examples/kitchen-sink.html` — every component on one page; its source is the
  copy-paste reference. Rendered and verified.

### Palette / type (authoritative per the kit)
Code Coral `#F25E45` (accent + focus ring), Disc Pink `#DE9DCC` (info, and the primary *hover*
— hue jump, not a tint), Data Green `#6EB579` (positive), Digital Pollen `#F0C968` (warn),
Warm Black `#1A1414` (base). Derived surfaces `#221A1A` / `#2A1F1F` / `#332626` for
elevated / card / hover. Typeface **Archivo** (variable, OFL).

Three-tier indirection: raw brand → semantic role → component. **Components must never
reference a raw `--nutrient-*` value** — that's what keeps re-theming a one-file change.

### Components that map onto our wizard
- `nk-shell` / `nk-header` + `nk-brand` / `nk-main` / `nk-page-header` / `nk-footer` — app scaffold
- **`nk-tabs`** with `nk-tab-title` + `nk-tab-meta` (two-line tabs) — natural fit for the
  **DOCX / XLSX / PPTX** format switcher, and the meta line can carry placeholder counts
- **`nk-workspace`** (+ `--wide-aside`) with `nk-sidebar` — the step-3 layout: JSON editor
  beside a placeholder reference
- `nk-grid` + `nk-card nk-card--interactive` + `nk-card-media` — step-1 template picker
- `nk-panel`, `nk-field`/`nk-label`/`nk-textarea`, `nk-btn --primary`, `nk-badge`, `nk-mono`,
  `nk-crumbs`, `nk-empty` — everything else
- `nk-stat` — could surface generation timing / placeholder counts

### Two conventions worth honoring
- **"Active" means inverted** everywhere (off-white fill, dark ink) — one visual language for "on".
- **Motion caps at 180ms**, zeroed under `prefers-reduced-motion`.

### Accessibility caveat
`--text-muted` `#67594B` is **2.69:1 — fails AA**, decorative use only. The kit ships an
opt-in fix we should apply globally, since our UI has real metadata text to read:

```css
:root { --text-muted: var(--text-muted-aa); }  /* #9A8878 — 5.34:1 */
```

### Licensing
- The kit CSS is authored by Nutrient and cleared by its author for use here.
- The logo PNGs are Nutrient trademarks. Fine for a Nutrient project; they must not be used
  to imply endorsement of anything that isn't one.
- **Archivo is loaded from Google Fonts rather than bundled.** It is OFL-licensed, and the OFL
  requires its licence text to travel with the font file — linking it avoids redistributing a
  `.woff2` with no `OFL.txt` beside it.
- The kit is **not** the official Nutrient design system — that's
  [Baseline UI](https://www.nutrient.io/baseline-ui/). Don't describe it as such.

## 7. Verified against the real SDK (2026-08-03)

Built and run with .NET SDK 10.0.302 against `GdPicture.API` **14.4.7** (not 14.4.2 — that
version number came from a search result, the current one is 14.4.7, targeting `net10.0`).

### API corrections found by inspecting the package XML docs and compiling

The guides were misleading in three places. All were caught before/at compile time:

| What the samples imply | What the package actually exposes |
|---|---|
| `templater.LoadFromStream(stream, false)` | `LoadFromStream(Stream)` — **one** argument only |
| `converter.LoadFromStream(stream)` | requires an explicit `DocumentFormat` — there is **no auto-detect** on the stream overload (unlike `LoadFromFile`) |
| `using LicenseManager license = new()` | `LicenseManager` is **not** `IDisposable`; registration is process-wide |

Two more build-level gotchas:
- `GdPicture14` contains both a `DocumentFormat` **namespace** and a `DocumentFormat` **enum**;
  the namespace shadows the enum, so it must be fully qualified as `GdPicture14.DocumentFormat`.
- The Web SDK includes `.json` as `Content` implicitly. A `Templates\**` glob therefore trips
  `NETSDK1022` (duplicate Content items) — declare the Office binaries explicitly and use
  `<Content Update>` for the models.

Confirmed correct as documented: `PdfConformance.PDF_UA_1` exists; `GdPictureOfficeTemplater`
and `GdPictureDocumentConverter` are both `IDisposable`; `SetTemplate(string)` /
`Process()` / `SaveToStream(Stream)` signatures are as the guides show.

### Generation results — all three formats

| Template | Output | Generate | + PDF/UA | PDF pages |
|---|---|---|---|---|
| contract.docx | 3,942 B | 254 ms | 1,418 ms | 1 |
| invoice.xlsx | 16,043 B | 79 ms | 717 ms | 1 |
| cv.pptx | 9,495 B | 63 ms | 468 ms | 3 |

Verified in the rendered output, not just by "a file was produced":
- **Zero leftover `{{...}}`** in any generated file.
- DOCX: all 4 deliverable rows expanded from the loop; the `{{#hasRetainer}}` conditional
  section rendered; nested `provider.*` / `client.*` paths resolved.
- XLSX: all 3 line-item rows expanded; currency and percentage **cell types preserved**.
- PPTX: loops expanded across slides 2 and 3; the base64 `{{%photo}}` became a real embedded
  `ppt/media/image.png`.
- PDF/UA: `/StructTreeRoot`, `/Marked true`, `/Lang en-US` present, and the `pdfuaid` XMP
  namespace is in the (compressed) metadata stream — so conformance is genuine, not nominal.
- The evaluation watermark ("For Evaluation Purposes Only") appears as expected with no key.

### Frontend
Walked all five steps against the live backend. XLSX generated in 8 ms and converted in 233 ms
through the UI. Two bugs found and fixed during testing: format badges stretched full-width
inside the card grid (`width: fit-content`), and the template cards — being `<button>`s with
only markup inside — exposed no accessible name (`aria-label` added).

Note: the PDF `<iframe>` shows blank in the headless preview pane, which has no PDF plugin.
Fetching the blob back out returns a byte-identical valid `%PDF-1.7`, and the PDFs render
correctly when rasterized natively — so this is a harness limitation, not an app bug.

## 8. Hand-editing OOXML: the duplicate-cell trap

Injecting `{{%logo}}` into `invoice.xlsx` by prepending a `<c r="B3">` to row 3 produced a row
with **two `B3` cells**. That is invalid OOXML, and the failure is asymmetric:

- **LibreOffice** opens it silently, repairing as it goes.
- **Excel** shows *"Excel was able to open the file by repairing or removing the unreadable
  content."*

So LibreOffice is not a sufficient check for spreadsheet edits. The fix was to populate the
*existing* `B3` (preserving its `s=` style attribute) rather than add a second one.

Checks worth running after any hand-edit of a sheet:
- no duplicate `r=` cell refs within a row, and no duplicate `r=` rows;
- cells in ascending column order within each row;
- every `.rels` `Target` resolves to a real part;
- every part has a content-type (`Default` by extension or an explicit `Override`).

Two false alarms encountered while chasing this, both from regexing OOXML by hand:
- the SDK rewrites worksheets with an `x:` namespace prefix (`<x:row>`), so patterns written
  against `<row` silently match nothing and look like "0 rows";
- the SDK writes relationship attributes as `Type` before `Id`, so a pattern expecting
  `Id="…" … Target="…"` finds no targets and looks like a dangling relationship.

## 9. Two XLSX authoring traps (found building the expense report)

### `<is><t>` must be wrapped in `<r>`

A hand-built sheet whose inline strings look like this makes `Process()` return
**`GenericError`** with no further detail:

```xml
<c r="B3" t="inlineStr"><is><t>{{name}}</t></is></c>          <!-- rejected -->
<c r="B3" t="inlineStr"><is><r><t>{{name}}</t></r></is></c>   <!-- accepted -->
```

The `<r>` rich-text run wrapper is required. Excel emits it automatically, which is why the
real `invoice.xlsx` fixture works and a hand-built sheet without it doesn't — and why the
earlier "minimal XLSX fails" note in §5 was misdiagnosed as "too minimal". It wasn't missing
`styles.xml` or `sharedStrings.xml`; it was missing `<r>`.

Isolated by swapping parts between a working and a failing package: my package + the invoice's
sheet processed fine, the invoice's package + my sheet failed — which pinned it to the sheet
XML, then to the cells. (Shared strings also work, but the `<r>` wrapper is the smaller fix.)

### Money must be a JSON *number*, not a formatted string

A `$`-formatted cell fed the string `"3,307.08"` rendered as **`03/07/0307`** — Excel coerced
the comma-grouped text to a date. Supply `3307.08` and let the cell's number format do the
formatting. Applies to any numeric cell type: dates, percentages, and currency.

## 10. DOCX section markers and the spacing they leave behind

A section marker occupies real markup. Where it sits decides both the spacing and whether
entries repeat per line or run together — and the three cases behave differently.

### Markers inside one paragraph → the *content* repeats, inline

```xml
<w:p>{{#items}}<run>{{label}}</run>{{/items}}</w:p>
```

The paragraph is emitted once and its content repeats, so entries concatenate onto one line.
Right for a sentence or a conditional clause; **wrong for a list** — "…benchmarks.Commercial
information…".

### Markers wrapping the paragraph → the *paragraph* repeats, one per line

```xml
<w:p>{{#items}}</w:p>  <w:p><run>{{label}}</run></w:p>  <w:p>{{/items}}</w:p>
```

Correct for bullet lists, but each marker leaves an empty paragraph in the output, which is the
ragged vertical gap between list items. Fix: give marker-only paragraphs zero spacing **and an
exact 1-twip line height**, so they collapse to nothing visible:

```xml
<w:pPr><w:spacing w:before="0" w:after="0" w:line="1" w:lineRule="exact"/></w:pPr>
```

`w:after="0"` alone is not enough — the paragraph still occupies a line's height.

### Markers in table cells → the `<w:tr>` repeats

Open in the row's **first** cell, close in its **last**:

```xml
<w:tr><w:tc>{{#rows}}{{a}}</w:tc> … <w:tc>{{b}}{{/rows}}</w:tc></w:tr>
```

The only pattern that works for tables; markers in a row of their own leave empty rows behind.

### Nesting requires the outer section to span paragraphs

Collapsing both levels into sibling one-paragraph sections **breaks scoping** — tested: the
outer headings ran together and the inner loop produced nothing. The outer pair must wrap the
heading *and* the inner list as separate block elements; only the inner loop can be collapsed.

`research/ooxml/docx.py` exposes this as `section()` (inline), `section_lines()` (per line),
`loop_row()` (tables) and `section_open()`/`section_close()` (spanning), so the choice is
explicit at the call site.

## 11. Open items

Resolved: .NET SDK installed (10.0.302); PDF/UA included as step 5; watermarked output
accepted for now; the DOCX template authored and verified.

Still open:
- **Licence key** — to be supplied later via `NUTRIENT_LICENSE_KEY`. Until then all output
  carries the evaluation watermark. Office templating is a separately licensed feature
  (`License.NativeSdkFeatures.OfficeTemplatingApi`).
- **Not yet built in Docker or deployed to Fly.io.** The `Dockerfile` and `fly.toml` are
  written but unexercised — in particular the MS core fonts install (Debian `contrib non-free`
  + EULA preseed) and whether `sources.list.d/debian.sources` vs `sources.list` is the right
  path on the aspnet:10.0 base image. The fallback in the RUN block covers both, but that is
  untested.
- **ARM64 unverified.** `fly.toml` targets x86_64 to match Nutrient's sample containers. The
  package ships managed assemblies only (no `runtimes/` folder), so ARM64 may well work — but
  it has not been tried.
- **No automated tests.** Verification so far has been manual. A small test that generates each
  template and asserts "no `{{` remains in the output" would cover the main regression risk
  cheaply.
- **Repo not yet created** under `milos-pspdf`, and nothing has been committed (`git init` was
  run; there are no commits).

- **Local tooling gap:** `dotnet` is not installed on this machine — needed before we can
  build or run anything.
- **License key** for `GdPicture.API` Office templating (separately licensed feature).
- **DOCX template** must be authored by us (no usable fixture in the PR).
- The `PresentationEditor` / `SpreadsheetEditor` API is unreleased; target the public
  `GdPictureOfficeTemplater` instead.
- Whether to include the PDF/UA conversion step (both PR samples end in PDF/UA — it's a
  strong accessibility story and cheap to add).

## Sources

- [DOCX guide (public)](https://www.nutrient.io/guides/dotnet/pdf-generation/from-word-template/)
- [PR #2959 — NAT-559](https://github.com/PSPDFKit/GdPicture/pull/2959) (branch `costinel/NAT-559`)
- PPTX sample guide: `Samples/Code/Intermediate/presentation-template-to-pdf-ua/gdpicture/`
- XLSX sample guide: `Samples/Code/Intermediate/spreadsheet-template-to-pdf-ua/gdpicture/`
- [Reference app](https://github.com/PSPDFKit/awesome-nutrient/tree/master/web/document-generator-vanillajs)
- [GdPicture.API on NuGet](https://www.nuget.org/packages/GdPicture.API)
