// Document Authoring SDK Types
export interface DocAuthSystem {
  createEditor: (
    element: HTMLElement,
    options: { document: DocAuthDocument },
  ) => Promise<DocAuthEditor>;
  createViewer: (
    element: HTMLElement,
    options: { document: DocAuthDocument },
  ) => Promise<DocAuthViewer>;
  importDOCX: (buffer: ArrayBuffer) => Promise<DocAuthDocument>;
  loadDocument: (docJson: unknown) => Promise<DocAuthDocument>;
}

export interface DocAuthEditor {
  destroy: () => void;
}

export interface DocAuthViewer {
  destroy: () => void;
  exportPDF: () => Promise<ArrayBuffer>;
}

export interface DocAuthDocument {
  exportDOCX: () => Promise<ArrayBuffer>;
  exportPDF: () => Promise<ArrayBuffer>;
}

// PSPDFKit Types
export interface PSPDFKitViewer {
  exportPDF: () => Promise<ArrayBuffer>;
  unload: () => Promise<void>;
}

export interface PSPDFKit {
  populateDocumentTemplate: (
    options: { document: ArrayBuffer },
    data: TemplateData,
  ) => Promise<ArrayBuffer>;
  unload: (container: HTMLElement | PSPDFKitViewer) => Promise<void>;
}

// CodeMirror interface for type safety
export interface CodeMirrorInstance {
  getValue(): string;
  setValue(value: string): void;
  toTextArea(): void;
  on(event: string, handler: (instance: CodeMirrorInstance) => void): void;
  refresh(): void;
}

// Application State Types
export interface AppState {
  docAuthSystem: DocAuthSystem | null;
  template: TemplateType | null;
  customTemplateBinary: ArrayBuffer | null;
  templateDocument: DocAuthDocument | null;
  templateEditor: DocAuthEditor | null;
  dataJson: TemplateData | null;
  dataEditor: CodeMirrorInstance | null;
  docxDocument: DocAuthDocument | null;
  docxEditor: DocAuthEditor | null;
  pdfViewer: PSPDFKitViewer | null;
  pdfDocument: ArrayBuffer | null;
}

// Template Types
export type TemplateType = "checklist" | "invoice" | "menu" | "custom";

export interface TemplateConfig {
  delimiter: {
    start: string;
    end: string;
  };
}

export interface TemplateData {
  config: TemplateConfig;
  model: Record<string, unknown>;
}

// Step Management Types
export type StepType =
  | "template-selection"
  | "template-editor"
  | "data-editor"
  | "docx-editor"
  | "pdf-viewer";

export interface StepState {
  currentStep: StepType;
  isTransitioning: boolean;
  transitionMessage: string;
}

// Template Selection Types
export interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  imagePath: string;
}

// Error Types
export interface AppError {
  message: string;
  step?: StepType;
  details?: unknown;
}

// Component Props Types
export interface StepProps {
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  navigateToStep?: (step: StepType) => Promise<void>;
  showError?: (message: string, duration?: number) => string;
  showSuccess?: (message: string, duration?: number) => string;
  showWarning?: (message: string, duration?: number) => string;
}

export interface TransitionProps {
  isVisible: boolean;
  message: string;
}

// Global declarations for external libraries
declare global {
  interface Window {
    DocAuth: {
      createDocAuthSystem: () => Promise<DocAuthSystem>;
    };
    PSPDFKit: PSPDFKit;
    NutrientViewer: {
      load: (options: {
        container: string;
        document: ArrayBuffer;
      }) => Promise<PSPDFKitViewer>;
    };
    CodeMirror: {
      fromTextArea: (
        textarea: HTMLTextAreaElement,
        options: Record<string, unknown>,
      ) => CodeMirrorInstance;
    };
  }
}
