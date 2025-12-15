import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  instance.addEventListener("annotations.create", (annotations) => {
    // Assuming we want to flatten annotations on the page where the annotation was added
    const pageIndexes = Array.from(
      new Set(annotations.map((annotation) => annotation.pageIndex)),
    );
    instance
      .applyOperations([
        { type: "flattenAnnotations", pageIndexes: pageIndexes },
      ])
      .catch((error) => {
        console.error("Failed to flatten annotations:", error);
      });
  });
});
