import type NutrientViewer from "@nutrient-sdk/viewer";

// Type definitions for DocAuth (loaded via CDN, no official types available)
interface DocAuthSystem {
  createEditor: (element: Element, options: { document: unknown }) => Promise<unknown>;
  importDOCX: (buffer: ArrayBuffer) => Promise<unknown>;
  loadDocument: (json: unknown) => Promise<unknown>;
}

// Type definitions for CodeMirror (loaded via CDN)
interface CodeMirrorConstructor {
  fromTextArea: (textarea: HTMLTextAreaElement, options?: Record<string, unknown>) => CodeMirrorEditor;
}

interface CodeMirrorEditor {
  getValue: () => string;
  setValue: (value: string) => void;
  getTextArea: () => HTMLTextAreaElement;
  toTextArea: () => void;
}

declare global {
  interface Window {
    // Nutrient Web SDK loaded via CDN
    NutrientViewer: typeof NutrientViewer;
    // DocAuth loaded via CDN
    DocAuth: DocAuthSystem;
    // CodeMirror loaded via CDN
    CodeMirror: CodeMirrorConstructor;
  }
  
  // Make NutrientViewer available globally
  const NutrientViewer: typeof import("@nutrient-sdk/viewer").default;
}

export {};
