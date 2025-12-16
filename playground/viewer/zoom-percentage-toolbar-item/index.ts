import type { ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  // Set the default zoom level to 100% on load
  instance.setViewState((viewState) => viewState.set("zoom", 1));

  // Create a custom toolbar item to display zoom percentage
  const toolbarItems: ToolbarItem[] = [
    {
      type: "custom",
      title: "100%",
      id: "zoom-display",
      dropdownGroup: "zoomGroup",
      selected: true,
      onPress: () => {
        instance.setViewState((viewState) => viewState.set("zoom", 1));
      },
    },
  ];

  // Add the custom toolbar item to the toolbar
  instance.setToolbarItems((items) => items.concat(toolbarItems));

  // Event listener to update zoom display dynamically
  instance.addEventListener("viewState.zoom.change", (zoom) => {
    if (typeof zoom === "number") {
      const percentage = Math.round(zoom * 100) + "%"; // Convert zoom level to percentage
      instance.setToolbarItems((items) =>
        items.map((item) =>
          item.id === "zoom-display" ? { ...item, title: percentage } : item,
        ),
      );
    }
  });
});
