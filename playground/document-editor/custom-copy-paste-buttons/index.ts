import type {
  DocumentEditorToolbarItem,
  DocumentOperations,
  Instance,
  List,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Copy the selected pages and then paste those pages
// after the currently selected page in document editor using custom buttons in toolbar

let _instance: Instance | null = null;
// Get the default toolbar items
const defaultToolbarItems =
  window.NutrientViewer.defaultDocumentEditorToolbarItems;
let copiedPagesBuffer: ArrayBuffer | null = null;
let copiedPages: number[] = [];

// Create a custom copy button
const copyButton: DocumentEditorToolbarItem = {
  type: "custom",
  id: "copy-pages",
  title: "Copy Pages",
  onPress: async (
    _event: Event,
    documentEditorUIHandler?: {
      getSelectedPageIndexes: () => number[];
    },
  ) => {
    if (!documentEditorUIHandler || !_instance) return;

    const selectedPageIndexes =
      documentEditorUIHandler.getSelectedPageIndexes();
    if (selectedPageIndexes.length > 0) {
      try {
        // Export only the selected pages
        const operations: DocumentOperations.DocumentOperationsUnion[] = [
          {
            type: "keepPages",
            pageIndexes: selectedPageIndexes,
          },
        ];

        copiedPagesBuffer = await _instance.exportPDFWithOperations(operations);
        copiedPages = selectedPageIndexes;
      } catch (error) {
        console.error("Error exporting pages:", error);
      }
    } else {
      alert("Please select pages to copy!");
    }
  },
};

// Create a custom paste button
const pasteButton: DocumentEditorToolbarItem = {
  type: "custom",
  id: "paste-pages",
  title: "Paste Pages",
  onPress: async (
    _event: Event,
    documentEditorUIHandler?: {
      getSelectedPageIndexes: () => number[];
      setOperations: (
        callback: (
          operations: List<
            | DocumentOperations.DocumentOperationsUnion
            | List<DocumentOperations.DocumentOperationsUnion>
          >,
        ) => List<
          | DocumentOperations.DocumentOperationsUnion
          | List<DocumentOperations.DocumentOperationsUnion>
        >,
        clearPagesSelection?: boolean,
      ) => void | Promise<void>;
    },
  ) => {
    if (!documentEditorUIHandler || !_instance) return;

    if (!copiedPagesBuffer) {
      alert("You haven't copied any pages yet!");
      return;
    }

    const selectedPageIndexes =
      documentEditorUIHandler.getSelectedPageIndexes();

    // Check if multiple pages are selected
    if (selectedPageIndexes.length > 1) {
      alert(
        "Please select only one page to paste after, or no pages to paste at the end.",
      );
      return;
    }

    // Determine where to insert the pages
    const afterPageIndex =
      selectedPageIndexes.length === 1
        ? selectedPageIndexes[0]
        : _instance.totalPageCount - 1;

    try {
      // Create a blob from the copied pages buffer
      const blob = new File(
        [copiedPagesBuffer],
        `Copied pages ${copiedPages
          .map((pageIndex: number) => pageIndex + 1)
          .toString()}`,
        {
          type: "application/pdf",
        },
      );

      documentEditorUIHandler.setOperations(
        (operations) =>
          operations.push({
            type: "importDocument",
            afterPageIndex: afterPageIndex,
            treatImportedDocumentAsOnePage: false,
            document: blob,
          }),
        true,
      );
      copiedPages = [];
      copiedPagesBuffer = null;
    } catch (error) {
      console.error("Error pasting pages:", error);
    }
  },
};

// Add the custom buttons to the toolbar items
const customToolbarItems: DocumentEditorToolbarItem[] = [
  ...defaultToolbarItems,
  copyButton,
  pasteButton,
];

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  documentEditorToolbarItems: customToolbarItems,
}).then((instance: Instance) => {
  _instance = instance;
});
