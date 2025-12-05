const baseOptions = {
  container: ".nutrient-viewer",
  document: "document.pdf",
};

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  inlineTextSelectionToolbarItems: (
    { defaultItems, hasDesktopLayout },
    selection,
  ) => {
    return [];
  },
}).then((instance) => {});
