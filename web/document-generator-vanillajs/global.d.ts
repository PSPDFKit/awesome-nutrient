import type NutrientViewer from "@nutrient-sdk/viewer";

declare global {
  interface Window {
    // Nutrient Web SDK loaded via CDN
    NutrientViewer?: typeof NutrientViewer;
    // DocAuth loaded via CDN
    DocAuth: any;
    // CodeMirror loaded via CDN
    CodeMirror: any;
  }
}

export {};
