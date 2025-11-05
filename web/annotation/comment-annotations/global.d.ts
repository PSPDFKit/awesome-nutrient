import type NutrientViewerNamespace from "@nutrient-sdk/viewer";

declare global {
  interface Window {
    // Nutrient Web SDK loaded via CDN
    NutrientViewer: typeof NutrientViewerNamespace;
  }
}

export {};
