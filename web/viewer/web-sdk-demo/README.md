# Nutrient Web SDK Demo

A complete Vite + React + TypeScript app showcasing a custom shell around the Nutrient Web SDK:

- A side file explorer with drag-and-drop PDF uploads
- A fully custom top toolbar (page navigation, rotate, move/add/delete pages, search, zoom, download)
- A floating, draggable **ink** toolbar with a colour grid and stroke width picker
- A floating, draggable **text** toolbar (font colour, size, bold/italic, alignment)
- A signing flow: signer management, drag-and-drop placement of signature/initials/auto-fill/standard fields, and a draw/type/upload/saved signature modal
- A custom Form Creator property editor mounted into the SDK's slot
- A shared Baseline UI dark theme applied to both the host app and the SDK iframe

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

The SDK is loaded via the `<script src="https://cdn.cloud.pspdfkit.com/pspdfkit-web@1.15.0/nutrient-viewer.js">` tag in `index.html`, so no `pspdfkit-lib` copy step is required. The SDK auto-detects its asset `baseUrl` from the script's origin.

> **Important:** The grouped UI customization slots used by this demo (`tools.main`, `signatures.create`, `formCreator.propertyEditor`, etc.) were introduced in **Web SDK 1.14**. Older CDN versions (e.g. 1.5, 1.9) reject this config with "`tools` is not a valid UI element". Stick to 1.14+ unless you adapt `src/NutrientViewer.tsx` to the older flat slot names.

### License key

Trial mode works out of the box. To run with a license, create `.env.development`:

```bash
VITE_LICENSE_KEY=your-license-key-here
```

## Project layout

```
src/
  App.tsx                       Orchestrates UI state
  NutrientViewer.tsx            SDK wiring (load, unload, setUI, theme, slot bridges)
  Toolbar.tsx                   Custom top toolbar
  FileExplorer.tsx              Sidebar with drag-and-drop PDF uploads
  main.tsx                      React root + ThemeProvider
  theme.ts                      Baseline UI dark theme (shared with the SDK iframe)
  styles.css                    Demo shell styles

  form-creator/                 Custom Form Creator property editor + tooltip buttons
    index.ts

  ink/InkToolbar.tsx            Floating draw-mode toolbar
  text/TextToolbar.tsx          Floating text-mode toolbar

  signing/
    SignersPanel.tsx            Side panel with field tray and signer dropdown
    SignersModal.tsx            Manage signers
    SigningModal.tsx            Draw / type / upload / pick a saved signature
    storage.ts                  localStorage layer for signers + saved signatures
    signatureTarget.ts          Page-space targeting for inserted signatures

  lib/
    selection.ts                Selection-shape normalization
    color.ts                    Hex → SDK Color
    sdk.ts                      Misc SDK helpers (FORM_CREATOR detection, Immutable.List)
    icons.tsx                   Shared React SVG icons

  types/                        Local type declarations for the window.NutrientViewer global
```

## Build

```bash
npm run build
npm run preview
```
