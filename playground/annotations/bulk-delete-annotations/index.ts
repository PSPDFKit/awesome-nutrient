import { baseOptions } from "../../shared/base-options";

// Bulk delete ALL annotations
window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  const items = instance.toolbarItems;

  const deleteButton = {
    type: "custom",
    id: "delete-annotations",
    title: "Delete", // or "Remove"
    onPress: async () => {
      try {
        const pagesAnnotations = await Promise.all(
          Array.from({ length: instance.totalPageCount }).map((_, pageIndex) =>
            instance.getAnnotations(pageIndex),
          ),
        );

        const annotationIds = pagesAnnotations.flatMap((pageAnnotations) =>
          pageAnnotations.map((annotation) => annotation.id).toArray(),
        );

        if (annotationIds.length === 0) {
          console.info("No annotations to delete.");
          return;
        }

        await instance.delete(annotationIds);
        console.info(`Deleted ${annotationIds.length} annotations.`);
      } catch (e) {
        console.error("Failed to delete annotations:", e);
      }
    },
  };

  instance.setToolbarItems([...items, deleteButton]);
});
