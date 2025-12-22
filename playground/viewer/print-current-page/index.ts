import type { Instance, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let nutrientInstance: Instance;

const printToolbarItem: ToolbarItem = {
  type: "custom",
  id: "Print",
  responsiveGroup: "annotate",
  selected: false,
  title: "Print single page",
  onPress() {
    const currentPageIndex = nutrientInstance.viewState.currentPageIndex;
    const operations = [
      { type: "keepPages" as const, pageIndexes: [currentPageIndex] },
    ];

    nutrientInstance.exportPDFWithOperations(operations).then((buffer) => {
      const blob = new Blob([buffer], { type: "application/pdf" });
      const objectURL = URL.createObjectURL(blob);

      // Create an iframe and add it to the DOM
      const pdfFrame = document.createElement("iframe");
      pdfFrame.id = "pdf-frame";
      pdfFrame.style.display = "none";
      document.body.appendChild(pdfFrame);

      // Load the PDF object URL into the iframe
      pdfFrame.src = objectURL;

      // Wait until the iframe has loaded its content before printing
      pdfFrame.onload = () => {
        pdfFrame.contentWindow?.print();
      };
    });
  },
};

// Add print button after the export-pdf button
const defaultItems = window.NutrientViewer.defaultToolbarItems;
const exportPdfIndex = defaultItems.findIndex(
  (item) => item.type === "export-pdf",
);
const toolbarItems = [
  ...defaultItems.slice(0, exportPdfIndex + 1),
  printToolbarItem,
  ...defaultItems.slice(exportPdfIndex + 1),
];

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems,
}).then((instance) => {
  nutrientInstance = instance;
});
