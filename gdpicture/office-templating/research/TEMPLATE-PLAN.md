# Template library plan

Expanding from 3 templates to 12, grouped by format in the UI. All authored by us and
brand-styled — see "Why authored" below.

## Why authored rather than sourced

US federal forms are public domain (17 U.S.C. §105), so they're licence-clean. But a
public-domain document is a *filled* or *blank* form, not a template: turning one into a
template means stripping its content and inserting `{{placeholders}}` regardless. That's the
same authoring work, with three costs on top — visual inconsistency with the demo UI, dated
layouts, and no control over which templating features each one exercises.

Authoring gives a consistent brand look, guaranteed licence cleanliness, and lets each template
be *designed* to demonstrate a specific feature set.

Where realism matters we use real figures and conventions: the expense report uses the actual
[IRS 2026 standard mileage rate of 72.5¢/mile](https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents),
and document structures follow published conventions rather than invention.

## Coverage gap this fixes

Current state — the syntax reference advertises five constructs, but the templates only
exercise three:

| Construct | contract.docx | invoice.xlsx | cv.pptx |
|---|---|---|---|
| `{{value}}` | 21 | 23 | 14 |
| `{{group.field}}` | ✅ | ✅ | — |
| `{{#section}}` | 2 | 1 | 3 |
| `{{^inverted}}` | **0** | **0** | **0** |
| `{{%image}}` | 1 | 1 | 1 |

**Nothing demonstrates `{{^inverted}}` at all.** Also untested: nested sections, multiple
images in one document, empty-array rendering, and image sizing modes beyond the default.

## The library

Each template is assigned a feature it exists to demonstrate, so the set teaches rather than
repeats. ★ marks the template that is the primary showcase for that feature.

### DOCX — 5

| Template | Demonstrates |
|---|---|
| **Service agreement** (existing) | Nested fields, row loop, conditional clause, image with full options ★ |
| **Mutual NDA** | ★ **Inverted sections** — mutual vs one-way obligations; nested sections (clauses → sub-clauses) |
| **Offer letter** | ★ Conditional blocks — signing bonus, relocation, visa sponsorship each appear only when present |
| **Project status report** | ★ Multiple images in one document (charts); loop over risks with a per-row severity |
| **Statement of work** | ★ Nested sections — milestones, each with its own deliverables list |

### XLSX — 4

| Template | Demonstrates |
|---|---|
| **Invoice** (existing) | Row loop, nested fields, cell types, image ★ |
| **Expense report** | ★ Multiple independent row loops (expenses, mileage) + real IRS mileage rate |
| **Timesheet** | ★ Wide layout — days as columns, tasks as rows; billable/non-billable conditionals |
| **Departmental budget** | ★ Budget vs actual vs variance; numeric and percentage cell types preserved |

### PPTX — 3

| Template | Demonstrates |
|---|---|
| **Résumé deck** (existing) | Loops across slides, image ★ |
| **Pitch deck** | ★ One slide per loop entry — a repeating "traction metric" slide |
| **QBR deck** | ★ Inverted sections on slides — "no misses this quarter" alternative content |

## Format-specific constraints to respect

From [IMAGE-OPTIONS.md](IMAGE-OPTIONS.md): PPTX honours only border on images and clamps sizing
to the placeholder shape; XLSX ignores link and caption; DOCX supports everything. So the
image-heavy showcases belong in DOCX, and PPTX templates should not promise caption/alt-text
behaviour they can't deliver.

## Verified capabilities (2026-08-03)

The NDA template was built specifically to test three constructs nothing had exercised.
All three work, confirmed by generating both variants and diffing the rendered text:

- **`{{^inverted}}` sections** — `mutual: true` renders reciprocal language and suppresses
  the one-way text; `mutual: false` does the reverse. The same flag drives `{{#mutual}}` and
  `{{^mutual}}` in different places, and both resolve correctly.
- **Nested sections** — `{{#obligations}}` containing `{{#points}}`: each clause rendered
  with its own correctly-scoped sub-list.
- **Multiple independent conditionals in one document** — `requiresReturn: false` dropped its
  clause while the surrounding section text stayed, and numbering continued to clause 7.

Zero leftover placeholders in either variant.

### Also confirmed
- **Sections under a dotted path** — `{{#problem.points}}`, `{{#solution.capabilities}}`,
  `{{#team.members}}` all expand correctly (pitch deck).
- **Two independent row loops in one worksheet** — expenses and mileage (expense report).

### Confirmed limitation: a PPTX section cannot span shapes

A section opened in one shape and closed in another **does not repeat the slide**. Tested by
wrapping a whole slide's shapes in `{{#milestones}}` … `{{/milestones}}`: the deck stayed at
8 slides and the engine *consumed* the content, leaving the slide nearly empty with only its
static label. All three entries were lost, and `Process()` still returned `OK`.

A section must open and close **inside a single shape**, repeating the paragraphs it encloses —
which is how the Nutrient `cv.pptx` fixture does it. So "one slide per record" isn't available;
the working pattern is a repeating block within one text box.

This is worth stating plainly in the demo, since a deck-per-record generator is the obvious
thing someone would reach for.

## Authoring method

Built by script (as `build_docx.py` already does) rather than by hand in Office, because:
- Word splits runs mid-word, which silently breaks `{{placeholders}}`;
- hand-editing XLSX XML caused a duplicate-cell corruption that only Excel flagged
  (see FINDINGS.md §8);
- scripted templates are diffable, reproducible, and can be regenerated after a change.

One builder per format, sharing helpers, writing directly into `Templates/`.

## UI

Group by format with counts, using the design kit's two-line tabs (`nk-tab-title` +
`nk-tab-meta`) — which exist for exactly this. Reinforces the "one API, three formats" point
that is the demo's whole argument.


## Delivered (2026-08-03)

Seventeen templates, discovered from the folder rather than a hardcoded list. All seventeen
validate, generate and export PDF/UA with no leftover placeholders and no dangling package
relationships.

| Format | Templates |
|---|---|
| DOCX (6) | service agreement, mutual NDA, offer letter, statement of work, status report, meeting minutes |
| XLSX (6) | invoice, expense report, timesheet, budget, quotation, price list |
| PPTX (5) | résumé deck, pitch deck, QBR deck, project kick-off, training deck |

The catalogue is now `TemplateCatalog` scanning `Templates/` at startup: an Office file plus a
matching `.model.json`, with an optional `.meta.json` for title/subtitle/features/order. Adding
a template needs no C# change — which is what made this batch tractable.

### Two things this batch established

- **An empty array is falsy for `{{^section}}`.** The status report shows a decisions list when
  there are decisions and an explicit "none this period" note when the array is empty, driven by
  the same collection. Verified both ways.
- **Multi-sheet XLSX workbooks survive templating.** The price list has two worksheets — products
  and volume discount bands — and both are preserved with their loops intact.

### One authoring trap worth remembering

An inverted section's content must sit *inside* the section, not after it. First attempt put the
"no decisions" note in a following paragraph, so it printed unconditionally alongside the list it
was meant to replace — a contradiction the generated document stated plainly.
