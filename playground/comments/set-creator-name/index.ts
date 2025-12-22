import { baseOptions } from "../../shared/base-options";

// Set the annotation creator name (e.g., from login/authentication)
const username = "John Smith";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [{ type: "comment" }],
}).then((instance) => {
  instance.setAnnotationCreatorName(username);
});
