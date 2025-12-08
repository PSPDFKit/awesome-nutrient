import type { Annotation } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Skip the Delete confirmation pop-up dialog for Annotations
window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  // Skip annotation delete confirmation popup
  instance.addEventListener("annotations.willChange", (event) => {
    // Check if this is a delete start action
    if (
      event.reason ===
      window.NutrientViewer.AnnotationsWillChangeReason.DELETE_START
    ) {
      const annotation = event.annotations.first() as Annotation | undefined;
      if (!annotation) return;

      // Delete the annotation immediately
      instance.delete(annotation.id);

      // Click the cancel button to prevent the dialog from showing
      const cancelButton = instance.contentDocument.querySelector(
        ".PSPDFKit-Confirm-Dialog-Button-Cancel",
      ) as HTMLElement | null;
      cancelButton?.click();
    }
  });
});
