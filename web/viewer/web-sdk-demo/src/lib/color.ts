type RGB = { r: number; g: number; b: number }
type ColorCtor = new (rgb: RGB) => unknown

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

/**
 * Build a `PSPDFKit.Color` from a `#rrggbb` string, returning `null` if the
 * SDK global isn't on `window` yet. The SDK is loaded via script tag, so this
 * can briefly be undefined during boot.
 */
export function buildSDKColor(hex: string): unknown | null {
  const Ctor = (window.NutrientViewer as { Color?: ColorCtor } | undefined)?.Color
  if (!Ctor) return null
  return new Ctor(hexToRgb(hex))
}
