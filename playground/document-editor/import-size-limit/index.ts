import type {
  DocumentEditorToolbarItem,
  DocumentEditorUIHandler,
  DocumentOperations,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Replace the Document Editor's Import Document button with one that rejects
// PDFs over a size limit before they're added to the document.

// 1 MB here is 1024 × 1024 bytes.
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const importButton: DocumentEditorToolbarItem = {
  type: "custom",
  id: "import-pdf-with-size-limit",
  title: "Import PDF",
  onPress: (_event: Event, handler: DocumentEditorUIHandler) => {
    // A file input that isn't added to the page opens the file chooser.
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("The file must be a PDF.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        // Round up so a file just over the limit doesn't read as 25.0 MB.
        const fileSizeMB = (
          Math.ceil((file.size / 1024 / 1024) * 10) / 10
        ).toFixed(1);
        alert(
          `This PDF is ${fileSizeMB} MB. You can import PDFs up to ${MAX_FILE_SIZE_MB} MB.`,
        );
        return;
      }

      // Insert after the last selected page. With no page selected, insert at
      // the start, like the built-in button.
      const selectedPages = handler.getSelectedPageIndexes();
      const position =
        selectedPages.length > 0
          ? { afterPageIndex: Math.max(...selectedPages) }
          : { beforePageIndex: 0 };

      const operation: DocumentOperations.DocumentOperationsUnion = {
        type: "importDocument",
        ...position,
        // The Document Editor shows the imported PDF as one page until the
        // user saves, so later edits to other pages need it counted as one.
        treatImportedDocumentAsOnePage: true,
        document: file,
      };

      // Stage the import. It's applied when the user saves.
      handler.setOperations((operations) => operations.push(operation), true);
    };

    input.click();
  },
};

NutrientViewer.load({
  ...baseOptions,
  theme: NutrientViewer.Theme.DARK,
  documentEditorToolbarItems: [
    importButton,
    ...NutrientViewer.defaultDocumentEditorToolbarItems.filter(
      (item) => item.type !== "import-document",
    ),
  ],
});
