import type { DocumentEditorToolbarItem, Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let nutrientInstance: Instance;

const customItem: DocumentEditorToolbarItem = {
  type: "custom",
  id: "ExportPDF",
  title: "Export Selected Pages",
  onPress: () => {
    // Get the pageIds of the page selected in the Document Editor
    const selectedPages = nutrientInstance.contentDocument.querySelectorAll(
      ".PSPDFKit-DocumentEditor-Thumbnails-Page-Selected",
    );
    const pagesToExport = Array.from(selectedPages)
      .map((page) => {
        const parent = (page as HTMLElement).parentNode?.parentNode
          ?.parentNode as HTMLElement | null;
        return parent?.getAttribute("data-id");
      })
      .filter((id): id is string => id !== null && id !== undefined)
      .map(Number)
      .sort((a, b) => a - b);

    // Get the document as a PDF ArrayBuffer
    const operations = [
      { type: "keepPages" as const, pageIndexes: pagesToExport },
    ];
    nutrientInstance
      .exportPDFWithOperations(operations)
      .then((pdfArrayBuffer) => {
        // You can then send this ArrayBuffer to your server, save it, or turn it into a Blob to download
        const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "exported.pdf";
        link.click();
        // Remember to revoke the URL to avoid memory leaks
        setTimeout(() => URL.revokeObjectURL(url), 100);
      });
  },
};

// Get the default toolbar items and add a custom item to the list
const defaultToolbarItems = [
  ...window.NutrientViewer.defaultDocumentEditorToolbarItems,
  customItem,
];

window.NutrientViewer.load({
  ...baseOptions,
  documentEditorToolbarItems: defaultToolbarItems,
}).then((instance) => {
  nutrientInstance = instance;
});
