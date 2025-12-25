import type { Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  initialViewState: new window.NutrientViewer.ViewState({
    sidebarOptions: {
      [window.NutrientViewer.SidebarMode.ANNOTATIONS]: {
        includeContent: [
          ...window.NutrientViewer.defaultAnnotationsSidebarContent,
          window.NutrientViewer.Annotations.RedactionAnnotation,
        ],
      },
    },
  }),
}).then((instance: Instance) => {
  instance.setToolbarItems((items) => [
    ...items,
    { type: "redact-text-highlighter" },
  ]);
});
