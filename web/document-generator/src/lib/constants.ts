import type { TemplateOption } from "@/types";

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "checklist",
    name: "Checklist",
    description: "Create a checklist with predefined data.",
    imagePath: "/assets/checklist.png",
  },
  {
    id: "invoice",
    name: "Invoice",
    description: "Create an invoice with predefined data.",
    imagePath: "/assets/invoice.png",
  },
  {
    id: "menu",
    name: "Menu",
    description: "Create a menu with predefined data.",
    imagePath: "/assets/menu.png",
  },
];

export const STEP_TITLES = {
  "template-selection": "(1/5) Select Template",
  "template-editor": "(2/5) Edit DocJSON Template",
  "data-editor": "(3/5) Prepare JSON Data",
  "docx-editor": "(4/5) Edit Generated DOCX",
  "pdf-viewer": "(5/5) Final PDF",
} as const;

export const TRANSITION_MESSAGES = {
  "template-selection": "Preparing templates...",
  "template-editor": "Preparing template editor...",
  "data-editor": "Preparing data JSON...",
  "docx-editor": "Opening generated DOCX file...",
  "pdf-viewer": "Opening generated PDF file...",
} as const;
