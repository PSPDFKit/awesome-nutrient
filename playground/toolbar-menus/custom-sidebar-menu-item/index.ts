import type { Instance, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance: Instance) => {
  const customButton: ToolbarItem = {
    type: "custom",
    id: "my-button",
    title: "Show/Hide",
    dropdownGroup: "sidebar",
    onPress: () => {
      alert("custom button added");
    },
  };

  const toolbarItems: ToolbarItem[] = [];
  for (const item of window.NutrientViewer.defaultToolbarItems) {
    toolbarItems.push(item);
    if (item.type === "sidebar-thumbnails") {
      toolbarItems.push(customButton);
    }
  }

  instance.setToolbarItems(toolbarItems);
});
