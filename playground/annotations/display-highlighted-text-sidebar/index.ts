import type { CustomUI, Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Declare instance variable
let instance: Instance | null = null;

// Custom UI Configuration for the sidebar
const customUIConfiguration: CustomUI = {
  [window.NutrientViewer.UIElement.Sidebar]: {
    [window.NutrientViewer.SidebarMode.ANNOTATIONS]: ({ containerNode }) => ({
      node: containerNode,
      onRenderItem: ({ item: annotation, itemContainerNode }) => {
        // If the annotation is a highlight, fetch the text within the highlight
        if (
          annotation instanceof
          window.NutrientViewer.Annotations.HighlightAnnotation
        ) {
          instance
            ?.getTextFromRects(annotation.pageIndex, annotation.rects)
            .then((text) => {
              const labelElement = (
                itemContainerNode as HTMLElement
              ).querySelector(".BaselineUI-Text");
              if (labelElement) {
                labelElement.textContent = text;
              }
            });
        }
      },
    }),
  },
};

// Load NutrientViewer with custom configurations
window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  customUI: customUIConfiguration,
}).then((_instance) => {
  instance = _instance;
  console.log("NutrientViewer for Web successfully loaded!!", instance);
});
