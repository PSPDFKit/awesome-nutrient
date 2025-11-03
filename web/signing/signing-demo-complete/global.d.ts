import type NutrientViewerNamespace from "@nutrient-sdk/viewer";

declare global {
  interface Window {
    NutrientViewer: typeof NutrientViewerNamespace;
  }
}

export {};
