import type { Instance, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [{ type: "layout-config" }, { type: "export-pdf" }],
}).then((instance: Instance) => {
  const rotateLeftButton: ToolbarItem = {
    type: "custom",
    id: "rotate-left",
    title: "Rotate Left",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity=".15" y="1" width="24" height="22" rx="1.25" fill="currentColor"></rect><rect opacity=".15" x=".5" y="1.5" width="23" height="21" rx=".75" stroke="currentColor"></rect><path d="M9 6.65l2.415-2.415a.05.05 0 0 1 .085.036v4.758a.05.05 0 0 1-.085.036L9 6.65z" fill="currentColor" stroke="currentColor" stroke-linecap="round"></path><path d="M12 19.5a6.5 6.5 0 1 0 0-13" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"></path><path opacity=".66" d="M8.641 18.566a6.532 6.532 0 0 1-2.214-2.219" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"></path><path opacity=".33" d="M5.5 13c0-.884.176-1.726.496-2.494" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"></path></svg>`,
    onPress: () => {
      instance.applyOperations([
        {
          type: "rotatePages",
          pageIndexes: [instance.viewState.currentPageIndex],
          rotateBy: 270,
        },
      ]);
    },
  };

  const rotateRightButton: ToolbarItem = {
    type: "custom",
    id: "rotate-right",
    title: "Rotate Right",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity=".15" y="1" width="24" height="22" rx="1.25" fill="currentColor"></rect><rect opacity=".15" x=".5" y="1.5" width="23" height="21" rx=".75" stroke="currentColor"></rect><path d="M15 6.65l-2.415-2.415a.05.05 0 0 0-.085.036v4.758a.05.05 0 0 0 .085.036L15 6.65z" fill="currentColor" stroke="currentColor" stroke-linecap="round"></path><path d="M12 19.5a6.5 6.5 0 1 1 0-13" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"></path><path opacity=".66" d="M15.359 18.566a6.532 6.532 0 0 0 2.214-2.219" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"></path><path opacity=".33" d="M18.5 13a6.48 6.48 0 0 0-.496-2.494" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"></path></svg>`,
    onPress: () => {
      instance.applyOperations([
        {
          type: "rotatePages",
          pageIndexes: [instance.viewState.currentPageIndex],
          rotateBy: 90,
        },
      ]);
    },
  };

  instance.setToolbarItems((items) => [
    ...items,
    rotateLeftButton,
    rotateRightButton,
  ]);
});
