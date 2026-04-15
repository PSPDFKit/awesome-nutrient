import type NutrientViewerType from "@nutrient-sdk/viewer";

declare global {
  var NutrientViewer: typeof NutrientViewerType;

  interface Window {
    NutrientViewer: typeof NutrientViewerType;
  }
}
