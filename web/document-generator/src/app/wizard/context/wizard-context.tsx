"use client";

import type React from "react";
import { createContext, type ReactNode, useContext, useReducer } from "react";
import type {
  CodeMirrorInstance,
  DocAuthDocument,
  DocAuthEditor,
  DocAuthSystem,
  PSPDFKitViewer,
  TemplateData,
} from "@/types";

// Types
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  template: string | null;
  templateDocument: DocAuthDocument | null;
  templateEditor: DocAuthEditor | null;
  customTemplateBinary: ArrayBuffer | null;
  dataJson: TemplateData | null;
  dataEditor: CodeMirrorInstance | null;
  docxDocument: DocAuthDocument | null;
  docxEditor: DocAuthEditor | null;
  pdfDocument: ArrayBuffer | null;
  pdfViewer: PSPDFKitViewer | null;
  docAuthSystem: DocAuthSystem | null;
  isLoading: boolean;
  error: string | null;
}

type WizardAction =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_TEMPLATE"; payload: string }
  | { type: "SET_TEMPLATE_DOCUMENT"; payload: DocAuthDocument | null }
  | { type: "SET_TEMPLATE_EDITOR"; payload: DocAuthEditor | null }
  | { type: "SET_CUSTOM_TEMPLATE_BINARY"; payload: ArrayBuffer | null }
  | { type: "SET_DATA_JSON"; payload: TemplateData | null }
  | { type: "SET_DATA_EDITOR"; payload: CodeMirrorInstance | null }
  | { type: "SET_DOCX_DOCUMENT"; payload: DocAuthDocument | null }
  | { type: "SET_DOCX_EDITOR"; payload: DocAuthEditor | null }
  | { type: "SET_PDF_DOCUMENT"; payload: ArrayBuffer | null }
  | { type: "SET_PDF_VIEWER"; payload: PSPDFKitViewer | null }
  | { type: "SET_DOC_AUTH_SYSTEM"; payload: DocAuthSystem | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "COMPLETE_STEP"; payload: number }
  | { type: "RESET_WIZARD" };

// Initial state
const initialSteps: WizardStep[] = [
  {
    id: "template",
    title: "Choose Template",
    description: "Select a document template to get started",
    isComplete: false,
    isActive: true,
  },
  {
    id: "customize",
    title: "Customize Template",
    description: "Edit your template design and layout",
    isComplete: false,
    isActive: false,
  },
  {
    id: "data",
    title: "Add Data",
    description: "Provide the data to populate your document",
    isComplete: false,
    isActive: false,
  },
  {
    id: "preview",
    title: "Preview & Edit",
    description: "Review and make final adjustments",
    isComplete: false,
    isActive: false,
  },
  {
    id: "download",
    title: "Download",
    description: "Get your finished document",
    isComplete: false,
    isActive: false,
  },
];

const initialState: WizardState = {
  currentStep: 0,
  steps: initialSteps,
  template: null,
  templateDocument: null,
  templateEditor: null,
  customTemplateBinary: null,
  dataJson: null,
  dataEditor: null,
  docxDocument: null,
  docxEditor: null,
  pdfDocument: null,
  pdfViewer: null,
  docAuthSystem: null,
  isLoading: false,
  error: null,
};

// Reducer
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  console.log(
    "🏪 WizardReducer:",
    action.type,
    "payload:",
    "payload" in action ? action.payload : "none",
  );
  console.log("🏪 Current state before action:", {
    template: state.template,
    currentStep: state.currentStep,
    templateEditor: !!state.templateEditor,
    templateDocument: !!state.templateDocument,
  });

  switch (action.type) {
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload,
        steps: state.steps.map((step, index) => ({
          ...step,
          isActive: index === action.payload,
        })),
      };

    case "SET_TEMPLATE":
      return { ...state, template: action.payload };

    case "SET_TEMPLATE_DOCUMENT":
      return { ...state, templateDocument: action.payload };

    case "SET_TEMPLATE_EDITOR":
      return { ...state, templateEditor: action.payload };

    case "SET_CUSTOM_TEMPLATE_BINARY":
      return { ...state, customTemplateBinary: action.payload };

    case "SET_DATA_JSON":
      return { ...state, dataJson: action.payload };

    case "SET_DATA_EDITOR":
      return { ...state, dataEditor: action.payload };

    case "SET_DOCX_DOCUMENT":
      return { ...state, docxDocument: action.payload };

    case "SET_DOCX_EDITOR":
      return { ...state, docxEditor: action.payload };

    case "SET_PDF_DOCUMENT":
      return { ...state, pdfDocument: action.payload };

    case "SET_PDF_VIEWER":
      return { ...state, pdfViewer: action.payload };

    case "SET_DOC_AUTH_SYSTEM":
      return { ...state, docAuthSystem: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "COMPLETE_STEP":
      return {
        ...state,
        steps: state.steps.map((step, index) => ({
          ...step,
          isComplete: index === action.payload ? true : step.isComplete,
        })),
      };

    case "RESET_WIZARD":
      return initialState;

    default:
      return state;
  }
}

// Context
interface WizardContextType {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeCurrentStep: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

// Provider
export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const nextStep = () => {
    console.log("➡️ nextStep called, current step:", state.currentStep);
    if (state.currentStep < state.steps.length - 1) {
      dispatch({ type: "SET_CURRENT_STEP", payload: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    console.log(
      "⬅️ prevStep called, current step:",
      state.currentStep,
      "template:",
      state.template,
    );
    if (state.currentStep > 0) {
      dispatch({ type: "SET_CURRENT_STEP", payload: state.currentStep - 1 });
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < state.steps.length) {
      dispatch({ type: "SET_CURRENT_STEP", payload: step });
    }
  };

  const completeCurrentStep = () => {
    dispatch({ type: "COMPLETE_STEP", payload: state.currentStep });
  };

  const value = {
    state,
    dispatch,
    nextStep,
    prevStep,
    goToStep,
    completeCurrentStep,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

// Hook
export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
