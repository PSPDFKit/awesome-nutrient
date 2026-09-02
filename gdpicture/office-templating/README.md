# Office Templating

**[Live demo →](https://nutrient-office-templating.fly.dev)**

A showcase of Office templating with the [Nutrient .NET SDK](https://www.nutrient.io/sdk/dotnet):
generate **Word, Excel and PowerPoint** documents from a template plus a JSON data model, then
export an accessible **PDF/UA-1** rendition.

Seventeen templates, all driven by the same four SDK calls. The in-browser PDF previews use the
[Nutrient Web SDK](https://www.nutrient.io/sdk/web).

The demo walks a six-step wizard — pick a template, inspect its placeholders, edit the data,
validate it, generate, export PDF. Any reached step can be clicked directly, state is preserved
throughout, and the template can be previewed as a PDF at any point.

- **Permalinks** — the step and template live in the URL (`?template=invoice&step=3`), so any
  point in the flow can be linked to or reloaded.
- **Bring your own template** — drop in a `.docx`/`.xlsx`/`.pptx` and its `{{placeholders}}` are
  read straight from the OOXML, then a starter data model is scaffolded from them. Uploads are
  held in memory for 30 minutes.
- **Validation gate** — the data model is checked against the template's actual placeholders,
  separating **errors** (which block) from **warnings** (which don't).

### Errors vs. warnings

The distinction is whether the document would still come out usable:

| | Examples | Effect |
| --- | --- | --- |
| **Error** | malformed JSON; delimiters that don't match the template; a section given a string; a value given an object; an image whose `data` isn't base64, or with a negative `width` or a bad `borderColor` | Blocks. Generation is refused at the API too. |
| **Warning** | a placeholder absent from the model; an empty string; an image with no payload yet; a field missing from some loop entries | Allowed. Those markers resolve to nothing. |

Each placeholder is listed with its own state and reason, so a warning says *which* entries are
missing a field rather than just failing the whole model.

### Why delimiters are checked

The engine substitutes using the delimiters from the model's `config` block. If those don't
match the ones the template was authored with, **nothing is substituted and the engine still
reports success** — you get a document that silently still shows its raw markers. Setting
`"start": "{"` against a `{{name}}` template is enough to trigger it.

So both validation and generation compare the configured pair against the template's own
markers, and name the mismatch:

> The delimiters "{" … "}}" don't match this template, which uses "{{" … "}}".
> Nothing would be substituted.

Uploaded templates aren't required to use `{{ }}`: the delimiters are detected from the file
(`<<name>>`, `${name}`, `[[name]]` and others), and the scaffolded model declares whichever pair
was found.

## The point of the demo

The templating engine is **format-neutral**. `GdPictureOfficeTemplater` detects the format from
the file you load, so the same four calls drive all three formats:

```csharp
using GdPictureOfficeTemplater templater = new();

templater.SetTemplate(json);        // config + data model
templater.LoadFromStream(template); // .docx | .xlsx | .pptx
templater.Process();                // resolve placeholders, expand loops
templater.SaveToStream(output);
```

One code path in [`TemplatingService.cs`](src/NutrientOfficeTemplating/Services/TemplatingService.cs)
serves every template in the catalogue.

## Template syntax

The JSON model carries both the delimiter configuration and the data:

```json
{
  "config": { "delimiter": { "start": "{{", "end": "}}" } },
  "model":  { "client": { "name": "Acme Corporation" } }
}
```

| Syntax | Meaning |
| --- | --- |
| `{{field}}` | Substitute a single value. |
| `{{group.field}}` | Dotted path into a nested object. |
| `{{#items}}…{{/items}}` | Repeat the block per array entry — table rows, slides, list items. |
| `{{^flag}}…{{/flag}}` | Render only when the value is absent or false. |
| `{{%image}}` | Insert an image, configured by an object in the model. |

### Image options

An image placeholder is driven by an object rather than a scalar:

```json
"logo": {
  "_type": "image", "source": "base64", "format": "png", "data": "iVBORw0…",
  "width": 64, "height": 64,
  "altText": "Nutrient logo", "title": "Provider mark",
  "borderColor": "F25E45", "borderWidth": 1, "borderStyle": "Solid",
  "rotation": 0, "link": "https://www.nutrient.io",
  "caption": "{{provider.name}} mark", "captionLabel": "Figure", "captionPosition": "Below"
}
```

**Support varies by format**, and unsupported options are ignored *silently* — no error:

| Option | DOCX | XLSX | PPTX |
| --- | --- | --- | --- |
| `width` / `height` | ✅ | ✅ | ⚠️ clamped to the placeholder shape |
| `borderColor` / `borderWidth` / `borderStyle` | ✅ | ✅ | ✅ |
| `altText` / `title` | ✅ | ✅ | ❌ |
| `rotation` | ✅ | ✅ | ❌ |
| `link` | ✅ | ❌ | ❌ |
| `caption` / `captionLabel` / `captionPosition` | ✅ (auto-numbered SEQ field) | ❌ | ❌ |

The step-2 screen renders this table for whichever format you pick. Note the JSON keys are
`width` / `borderWidth` — **not** the `widthInPixels` / `borderWidthPixels` names used by the
C# properties, which the engine ignores. Full details and how this was determined:
[research/IMAGE-OPTIONS.md](research/IMAGE-OPTIONS.md).

`altText` is worth setting on anything headed for the PDF/UA step — an image without alt text
is an accessibility failure.

## The templates

Seventeen, grouped by format in the UI.

| DOCX | XLSX | PPTX |
| --- | --- | --- |
| Service agreement | Invoice | Résumé deck |
| Mutual NDA | Expense report | Pitch deck |
| Offer letter | Timesheet | QBR deck |
| Statement of work | Budget | Project kick-off |
| Status report | Quotation | Training deck |
| Meeting minutes | Price list | |

Structures follow published conventions rather than invention — see
[research/DOCUMENT-CONVENTIONS.md](research/DOCUMENT-CONVENTIONS.md), which sources section
order and field names from SEC filings, California CDT ITPL 10-07, IRS TIPSS-3, and
IRS/GSA/DOL regulation. Where figures matter they're real: the expense report uses the IRS
2026 standard mileage rate, the status report the CDT's actual RAG thresholds.

### Adding one

A template is any Office file in `Templates/` with a matching `.model.json`. Drop in the two
files — plus an optional `.meta.json` for title, subtitle and features — and it appears in the
catalogue. No C# edit, no recompile.

```
Templates/
  offer-letter.docx
  offer-letter.model.json
  offer-letter.meta.json     ← optional: title, subtitle, features, order
```

The builders that author them live in `research/build_*.py`, sharing the OOXML helpers in
`research/ooxml/`. Templates are generated rather than authored in Office because Word splits
runs mid-word, which silently breaks a `{{placeholder}}`.

The XLSX and PPTX fixtures come from the Nutrient sample suite. The DOCX fixture is authored
for this demo by [`research/build_docx.py`](research/build_docx.py) — it builds the OOXML
directly so each `{{placeholder}}` lands in a single run. Word tends to split runs mid-word,
which silently breaks placeholders; generating the XML avoids that.

## Two SDKs

| | Where it runs | What it does |
| --- | --- | --- |
| **Nutrient .NET SDK** (`GdPicture.API`) | server | Generates the Office document and converts it to PDF/UA |
| **Nutrient Web SDK** (`@nutrient-sdk/viewer`) | browser | Renders every PDF preview — the template at step 2 and the output at step 6 |

The Web SDK replaced a plain `<iframe>`, which gave no control over appearance and rendered
blank wherever the browser had no PDF plugin. It brings page navigation, zoom, search and
themed chrome, and is loaded on demand — it pulls a WASM core, so nothing is paid for until a
preview is opened.

## Running it

Requires the **.NET 10 SDK** and **Node.js 20.17+ (20.x line) or 22.9+ with npm 11.10.0+** (Node.js is only used to fetch the Web SDK).

```bash
npm install && dotnet run --project src/NutrientOfficeTemplating
```

`npm install` fetches `@nutrient-sdk/viewer` and copies its distributable into
`wwwroot/vendor/nutrient/` via [`scripts/copy-web-sdk.mjs`](scripts/copy-web-sdk.mjs). That's
~148 MB of WASM and font resources, gitignored and pinned in `package.json` — the SDK loads
them at runtime from a `baseUrl`, so they can't be bundled or tree-shaken.

Then open <http://localhost:5199>.

### Licence keys

Both SDKs run without a key — the .NET one watermarks its output, the Web SDK runs in
time-limited trial mode — so the demo works unlicensed.

```bash
NUTRIENT_LICENSE_KEY="..." NUTRIENT_WEB_LICENSE_KEY="..." \
  dotnet run --project src/NutrientOfficeTemplating
```

| Variable | SDK | Notes |
| --- | --- | --- |
| `NUTRIENT_LICENSE_KEY` | .NET | Server-side only. Office templating is a separately licensed feature. |
| `NUTRIENT_WEB_LICENSE_KEY` | Web | Served to the browser via `/api/config`. |

The Web SDK key is **inherently public** once served — that's how a client-side SDK works.
Keeping it in a secret means it's absent from the repo and the image, and one image runs in
every environment; it does not make the key private. Never commit either key; `.env` and the
local appsettings files are gitignored.

## Deployed

**<https://nutrient-office-templating.fly.dev>** — Fly.io, `nutrient` org, `fra` region.

### Setting the licence keys

An interactive script prompts for one key at a time, so nothing ends up in your shell
history:

```bash
./scripts/set-fly-secrets.sh
```

It reports which keys are already set, reads each with terminal echo off, passes them to
`flyctl` on **stdin** (so they never appear in `ps`), applies both in a single rolling
restart, and then asks the live `/api/config` whether each SDK actually considers itself
licensed.

```bash
./scripts/set-fly-secrets.sh --show          # which keys are set, without changing anything
./scripts/set-fly-secrets.sh --app other     # target a different app
```

### Redeploying

```bash
flyctl deploy --remote-only
```

### Why there's a health check

An **unlicensed** .NET SDK terminates its own process after one hour — the log ends with the
SDK's own "restart the demo for another hour" message and `libc++abi: terminating`. The
`/healthz` check in `fly.toml` lets Fly notice a dead machine and replace it rather than route
to it. Setting `NUTRIENT_LICENSE_KEY` is the actual fix; the check is what stops an unlicensed
demo from simply looking broken.

Two things in the [`Dockerfile`](Dockerfile) are load-bearing:

- **A Node stage fetches the Web SDK.** Its assets are too large to commit, so they're pulled
  by npm at build time and copied into the published `wwwroot`. Node stays out of the runtime
  image.
- **`ttf-mscorefonts-installer` and `fontconfig` are required, not cosmetic.** The templates
  rely on Calibri/Arial metrics; without those fonts the Office-to-PDF conversion substitutes
  faces and the output reflows.

`fly.toml` asks for **2 GB** rather than 1: the .NET SDK rasterises Office documents
server-side, and Office-to-PDF conversion of a large workbook is the memory high-water mark.

## Layout

```
src/NutrientOfficeTemplating/
├── Program.cs              API endpoints + licence registration
├── Models/                 template catalogue
├── Services/
│   ├── TemplatingService   the generation + PDF/UA pipeline
│   ├── PlaceholderScanner  reads {{markers}} from OOXML, scaffolds a model
│   ├── ModelInspector      checks a model against a template's placeholders
│   └── UploadStore         in-memory, 30-minute store for uploads
├── Templates/              the three templates and their JSON models
└── wwwroot/                the wizard (vanilla JS, no build step)
    ├── vendor/             Nutrient design kit
    ├── css/app.css
    ├── js/app.js
    └── js/editor.js        the syntax-highlighting JSON editor
research/
├── FINDINGS.md             API, syntax and deployment notes, with sources
└── build_docx.py           authors the DOCX template
```

## Credits

The wizard's multi-step shape follows the
[document-generator POC](https://github.com/PSPDFKit/awesome-nutrient/tree/master/web/document-generator-vanillajs)
in `awesome-nutrient`, adapted for server-side .NET generation.
