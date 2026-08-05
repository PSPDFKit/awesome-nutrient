# Image placeholders — verified schema and support matrix

Everything here was determined **empirically** by generating documents with the real SDK
(`GdPicture.API` 14.4.7) and inspecting the resulting OOXML. The C# property names in the
SDK docs do **not** all map to the JSON keys, so the docs alone are misleading.

## The marker

`{{%name}}` with the default `{{`/`}}` delimiters. The SDK docs write it as `{%placeholder}`
— the `%` is a prefix on the *inner* name, so it sits inside whatever delimiters you configure.

## JSON keys — verified

```json
"logo": {
  "_type": "image",
  "source": "base64",
  "format": "png",
  "data": "iVBORw0…",

  "width": 160,
  "height": 160,

  "altText": "Portrait of Jane Doe",
  "title": "Profile photo",

  "borderColor": "F25E45",
  "borderWidth": 3,
  "borderStyle": "Solid",

  "rotation": 10,
  "link": "https://www.nutrient.io",
  "caption": "{{fullName}}",
  "captionLabel": "Figure",
  "captionPosition": "Below"
}
```

### Key-name traps (each cost a probe to find)

| Wrong (from the C# property names) | Correct JSON key |
|---|---|
| `widthInPixels` / `heightInPixels` | **`width`** / **`height`** |
| `borderWidthPixels` | **`borderWidth`** |
| `border: { color, width }` (nested) | flat `borderColor`, `borderWidth` |

`widthInPixels` and `borderWidthPixels` are **silently ignored** — status stays `OK` and the
image is inserted at its default size with no border. There is no error to tell you.

`borderColor` accepts `F25E45` or `#F25E45`. `rotation` is in degrees and is written as
60000ths of a degree in the XML (`10` → `rot="600000"`).

### Enum values
- `sizing`: `Original`, `Fixed`, `FitWidth`, `FitHeight`, `FitMax`
- `borderStyle`: `Solid`, `Dash`, `Dot`, `DashDot`, `LargeDash`, `SystemDash`
- `captionPosition`: `Above`, `Below`

Note: an explicit `width`/`height` alone is enough — passing `sizing: "Fixed"` is not required
and, on its own with `widthInPixels`, does nothing.

## Support matrix — what actually lands, per format

| Option | DOCX | XLSX | PPTX |
|---|---|---|---|
| image inserted | ✅ | ✅ | ✅ |
| `width` / `height` | ✅ | ✅ | ⚠️ clamped by the placeholder shape |
| `borderColor` / `borderWidth` / `borderStyle` | ✅ | ✅ | ✅ |
| `altText` | ✅ `wp:docPr/@name` | ✅ `@name` | ❌ ignored |
| `title` | ✅ `@descr` | ✅ `@descr` | ❌ ignored |
| `rotation` | ✅ | ✅ | ❌ ignored |
| `link` | ✅ external rel | ❌ ignored | ❌ ignored |
| `caption` (+ placeholders inside it) | ✅ | ❌ ignored | ❌ ignored |
| `captionLabel` → auto-numbered SEQ field | ✅ Word SEQ | ❌ | ❌ |

**DOCX is the only format with the full feature set.** PPTX supports image + border only;
its sizing is bounded by the template's placeholder shape (a 160px request came out 136px).
Unsupported options fail **silently** — `Process()` returns `OK` either way.

### Accessibility note
`altText` maps to `wp:docPr/@name` and `title` to `@descr` in DOCX/XLSX. An image with no alt
text is a genuine PDF/UA failure, so any template feeding the PDF/UA step should set `altText`.
PPTX ignores it — worth flagging in the UI rather than implying otherwise.

## Gotcha unrelated to images

A hand-built XLSX made `Process()` return `GenericError` even with **no** image placeholder at
all, while the real `invoice.xlsx` fixture worked.

**This was first attributed to the sheet being "too minimal" (missing `styles.xml` /
`sharedStrings.xml`). That was wrong.** The actual cause, isolated later: inline strings must be
wrapped in an `<r>` rich-text run — `<is><r><t>…</t></r></is>`, not `<is><t>…</t></is>`. See
FINDINGS.md §9. Excel writes the wrapper itself, which is why real fixtures work.

## Licensing observation
Unlicensed **console** use prints "time-limited to 1 hour". The web app's behaviour differs —
it watermarks output instead. Worth knowing if a long-running probe suddenly starts failing.
