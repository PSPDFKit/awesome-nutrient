import type { Events, Rect, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Allow text extraction even on protected documents
window.NutrientViewer.Options.IGNORE_DOCUMENT_PERMISSIONS = true;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  // Store the crop area and page index when user draws a selection
  let cropArea: Rect | null = null;
  let cropPageIndex: number | null = null;

  instance.addEventListener(
    "cropArea.changeStop",
    (event: Events.CropAreaChangeStopEvent) => {
      cropArea = event.cropBox;
      cropPageIndex = event.pageIndex;
    },
  );

  const extractTextItem: ToolbarItem = {
    type: "custom",
    id: "extract-text",
    title: "Extract Text from Selection",
    onPress: async () => {
      if (!cropArea || cropPageIndex === null) {
        return;
      }

      // Export a PDF containing only the cropped region
      const croppedPdf = await instance.exportPDFWithOperations([
        {
          type: "cropPages",
          pageIndexes: [cropPageIndex],
          cropBox: cropArea,
        },
      ]);

      // Load the cropped PDF in headless mode to extract text
      const headlessInstance = await window.NutrientViewer.load({
        ...baseOptions,
        document: croppedPdf,
        headless: true,
      });

      // Extract text from the cropped page
      const textLines = await headlessInstance.textLinesForPageIndex(0);
      const extractedText = textLines.map((line) => line.contents).join("");

      // Clean up the headless instance
      await window.NutrientViewer.unload(headlessInstance);

      // Display the extracted text (replace with your own handling)
      alert(`Extracted text:\n\n${extractedText}`);
    },
  };

  instance.setToolbarItems([
    { type: "document-crop" },
    { type: "zoom-out" },
    { type: "zoom-in" },
    extractTextItem,
  ]);
});
