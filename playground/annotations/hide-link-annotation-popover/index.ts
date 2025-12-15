import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  initialViewState: new window.NutrientViewer.ViewState({
    currentPageIndex: 1,
  }),
}).then(async (instance) => {
  const linkAnnotations = await instance.getAnnotations(1);
  instance.setSelectedAnnotations(linkAnnotations);
  console.log("NutrientViewer loaded!");
});
