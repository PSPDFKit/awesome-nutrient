import type NutrientViewer from "@nutrient-sdk/viewer";

declare global {
  interface Window {
    NutrientViewer: typeof NutrientViewer;
  }
}

export {};
