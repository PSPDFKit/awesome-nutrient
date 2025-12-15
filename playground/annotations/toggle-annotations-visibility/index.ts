import type { Annotation, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let annotationsHidden = true;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [...window.NutrientViewer.defaultToolbarItems],
}).then(async (instance) => {
  const toggleAnnotationsButton: ToolbarItem = {
    type: "custom",
    id: "toggle-annotations",
    title: "Toggle Annotations",
    onPress: async () => {
      const totalPages = instance.totalPageCount;
      const updatedAnnotations: Annotation[] = [];

      for (let i = 0; i < totalPages; i++) {
        const annotations = await instance.getAnnotations(i);

        annotations.forEach((annotation: Annotation) => {
          const updatedAnnotation = annotation.set("noView", annotationsHidden);
          updatedAnnotations.push(updatedAnnotation);
        });
      }

      await instance.update(updatedAnnotations);
      annotationsHidden = !annotationsHidden;
    },
  };

  instance.setToolbarItems((items) => {
    items.push(toggleAnnotationsButton);
    return items;
  });
});
