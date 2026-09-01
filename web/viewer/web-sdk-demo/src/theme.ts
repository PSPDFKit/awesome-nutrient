import { extendTheme, themes, type Theme } from '@baseline-ui/tokens'

/**
 * Single source of truth for the demo + SDK chrome.
 *
 * Built on top of `themes.base.dark` (Baseline UI's stock dark theme) and
 * extended via `extendTheme(...)` to flatten the surface palette to a
 * minimalist near-black, matching the demo shell.
 *
 * Passed two places:
 *   1. <ThemeProvider theme={demoDarkTheme}> in main.tsx — themes the demo
 *      sidebar/toolbar (parent document) by injecting `--bui-color-*` vars.
 *   2. PSPDFKit.load({ theme: demoDarkTheme }) in NutrientViewer.tsx — themes
 *      the SDK iframe (PSPDFKit Configuration accepts `ITheme | BUITheme`).
 *
 * Both sides share the *same theme object*, so anything we tweak here flips
 * the SDK and demo together — no CSS overrides, no runtime sync.
 */
/*
 * Accent (interactive) palette — vibrant blue.
 * Drives selected page thumbnail border, page-number badge, primary buttons,
 * focus rings, etc. The SDK reads these via `color.background.interactive.*`,
 * `color.border.interactive.*`, `color.text.interactive.*`, and
 * `color.icon.interactive.*`.
 */
const ACCENT_ENABLED = '#3b82f6' // blue-500
const ACCENT_HOVERED = '#60a5fa' // blue-400
const ACCENT_ACTIVE = '#2563eb' // blue-600

export const demoDarkTheme: Theme = extendTheme(themes.base.dark, {
  name: 'demo-dark',
  color: {
    background: {
      primary: {
        strong: '#1a1a1a',
        medium: '#1a1a1a',
        subtle: '#1a1a1a',
      },
      secondary: {
        medium: '#1a1a1a',
        // `strong` doubles as the hover surface for toolbar buttons. Keep it
        // bright enough to be clearly visible on top of the #1a1a1a chrome.
        strong: '#3a3a3a',
        subtle: '#1a1a1a',
      },
      interactive: {
        enabled: ACCENT_ENABLED,
        hovered: ACCENT_HOVERED,
        active: ACCENT_ACTIVE,
        visited: ACCENT_ENABLED,
      },
    },
    border: {
      medium: '#2a2a2a',
      subtle: '#1f1f1f',
      interactive: {
        enabled: ACCENT_ENABLED,
        hovered: ACCENT_HOVERED,
        active: ACCENT_ACTIVE,
        visited: ACCENT_ENABLED,
      },
    },
    text: {
      interactive: {
        enabled: ACCENT_ENABLED,
        hovered: ACCENT_HOVERED,
        active: ACCENT_ACTIVE,
        visited: ACCENT_ENABLED,
      },
    },
    icon: {
      interactive: {
        enabled: ACCENT_ENABLED,
        hovered: ACCENT_HOVERED,
        active: ACCENT_ACTIVE,
        visited: ACCENT_ENABLED,
      },
    },
  },
})
