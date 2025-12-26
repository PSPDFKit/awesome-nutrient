import { List } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  instance.addEventListener("annotations.press", (event) => {
    const { annotation } = event;

    // Handling special case for Text Annotations
    if (
      instance.getSelectedAnnotations() !== null &&
      annotation instanceof window.NutrientViewer.Annotations.TextAnnotation
    ) {
      return instance.setEditingAnnotation(annotation, false);
    }

    // Handling special case for Notes slightly different than Text Annotations
    if (
      annotation instanceof window.NutrientViewer.Annotations.NoteAnnotation
    ) {
      event.preventDefault?.();
      return instance.setEditingAnnotation(annotation, false);
    }

    // Ignoring Forms and Links to allow default focus and redirect behaviors respectively
    if (
      annotation instanceof
        window.NutrientViewer.Annotations.WidgetAnnotation ||
      annotation instanceof window.NutrientViewer.Annotations.LinkAnnotation
    ) {
      return;
    }

    // Preventing dragging for the rest of Annotation Types
    event.preventDefault?.();
    instance.setSelectedAnnotations(List([annotation]));
  });
});
