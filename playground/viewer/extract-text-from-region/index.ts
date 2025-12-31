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

      // Extract text from the selected region using getTextFromRects API
      const extractedText = await instance.getTextFromRects(
        cropPageIndex,
        window.NutrientViewer.Immutable.List([cropArea]),
      );

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
