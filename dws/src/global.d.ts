import NutrientViewer from "@nutrient-sdk/viewer";

declare global {
  interface Window {
    // Nutrient Web SDK will be available on `window.NutrientViewer` once loaded.
    NutrientViewer?: typeof NutrientViewer;
  }
}

// Extend Vite's ImportMeta interface to include env
declare global {
  interface ImportMetaEnv {
    readonly PUBLIC_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
