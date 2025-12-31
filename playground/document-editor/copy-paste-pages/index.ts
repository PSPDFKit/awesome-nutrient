import type {
  DocumentEditorToolbarItem,
  DocumentEditorUIHandler,
  DocumentOperations,
  Instance,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Copy and paste pages in document editor using custom toolbar buttons

let _instance: Instance | null = null;
let copiedPagesBuffer: ArrayBuffer | null = null;
let copiedPages: number[] = [];

const copyButton: DocumentEditorToolbarItem = {
  type: "custom",
  id: "copy-pages",
  title: "Copy Pages",
  onPress: async (_event: Event, handler?: DocumentEditorUIHandler) => {
    if (!handler || !_instance) return;

    const selectedPages = handler.getSelectedPageIndexes();
    if (selectedPages.length === 0) {
      alert("Please select pages to copy!");
      return;
    }

    const operations: DocumentOperations.DocumentOperationsUnion[] = [
      { type: "keepPages", pageIndexes: selectedPages },
    ];

    copiedPagesBuffer = await _instance.exportPDFWithOperations(operations);
    copiedPages = selectedPages;
  },
};

const pasteButton: DocumentEditorToolbarItem = {
  type: "custom",
  id: "paste-pages",
  title: "Paste Pages",
  onPress: async (_event: Event, handler?: DocumentEditorUIHandler) => {
    if (!handler || !_instance || !copiedPagesBuffer) {
      alert("You haven't copied any pages yet!");
      return;
    }

    const selectedPages = handler.getSelectedPageIndexes();
    if (selectedPages.length > 1) {
      alert("Please select only one page to paste after.");
      return;
    }

    const afterPageIndex =
      selectedPages.length === 1
        ? selectedPages[0]
        : _instance.totalPageCount - 1;

    const blob = new File([copiedPagesBuffer], "copied-pages.pdf", {
      type: "application/pdf",
    });

    handler.setOperations(
      (operations) =>
        operations.push({
          type: "importDocument",
          afterPageIndex,
          treatImportedDocumentAsOnePage: false,
          document: blob,
        }),
      true,
    );

    copiedPages = [];
    copiedPagesBuffer = null;
  },
};

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  documentEditorToolbarItems: [
    ...window.NutrientViewer.defaultDocumentEditorToolbarItems,
    copyButton,
    pasteButton,
  ],
}).then((instance: Instance) => {
  _instance = instance;
});
