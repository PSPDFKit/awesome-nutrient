import { List } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  instance.addEventListener("page.press", async (event) => {
    const { point, nativeEvent } = event;

    // Find annotation where click is within the outline area (outer - inner bounding box)
    const annotation = (await instance.getAnnotations(0)).find((annotation) => {
      const outerRect = annotation.boundingBox.grow(30);
      const innerRect = annotation.boundingBox.grow(-30);
      return outerRect.isPointInside(point) && !innerRect.isPointInside(point);
    });

    const isSelected = instance.getSelectedAnnotations();

    if (annotation && !isSelected) {
      nativeEvent.stopImmediatePropagation();
      setTimeout(
        () => instance.setSelectedAnnotations(List([annotation.id])),
        0,
      );
    }
  });
});
