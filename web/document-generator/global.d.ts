import type NutrientViewer from "@nutrient-sdk/viewer";

// Type definitions for DocAuth (loaded via CDN, no official types available)
export interface DocAuthDocument {
  exportDOCX: () => Promise<ArrayBuffer>;
  exportPDF: () => Promise<ArrayBuffer>;
}

export interface DocAuthEditor {
  destroy: () => void;
}

export interface DocAuthSystem {
  createEditor: (
    element: Element,
    options: { document: DocAuthDocument }
  ) => Promise<DocAuthEditor>;
  importDOCX: (buffer: ArrayBuffer) => Promise<DocAuthDocument>;
  loadDocument: (json: unknown) => Promise<DocAuthDocument>;
}

export interface DocAuthConstructor {
  createDocAuthSystem: () => Promise<DocAuthSystem>;
}

// Type definitions for CodeMirror (loaded via CDN)
export interface CodeMirrorConstructor {
  fromTextArea: (
    textarea: HTMLTextAreaElement,
    options?: Record<string, unknown>
  ) => CodeMirrorEditor;
}

export interface CodeMirrorEditor {
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
    DocAuth: DocAuthConstructor;
    // CodeMirror loaded via CDN
    CodeMirror: CodeMirrorConstructor;
  }
}
