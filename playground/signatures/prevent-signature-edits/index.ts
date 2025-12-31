import type { ImageAnnotation, InkAnnotation } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  isEditableAnnotation: (annotation) => {
    if ("isSignature" in annotation) {
      return !(annotation as InkAnnotation | ImageAnnotation).isSignature;
    }
    return true;
  },
}).then(() => {});
