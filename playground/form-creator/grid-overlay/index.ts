import type { Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Display grid overlay when focusing on annotations in Form Creator mode

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "form-creator" },
  ],
}).then(async (instance: Instance) => {
  const pageIndex = instance.viewState.currentPageIndex;
  const pageInfo = await instance.pageInfoForIndex(pageIndex);
  if (!pageInfo) return;

  const { width, height } = pageInfo;

  instance.addEventListener("annotations.focus", () => {
    attachGridOverlayToggle(instance, width, height, pageIndex);
  });

  instance.addEventListener("page.press", () => {
    setTimeout(() => {
      try {
        instance.removeCustomOverlayItem("grid-overlay");
      } catch (_) {
        // Ignore if overlay doesn't exist
      }
    }, 50);
  });
});

function attachGridOverlayToggle(
  instance: Instance,
  width: number,
  height: number,
  pageIndex: number,
) {
  try {
    instance.removeCustomOverlayItem("grid-overlay");
  } catch (_) {
    // Ignore if overlay doesn't exist
  }

  const grid = document.createElement("div");
  grid.style.width = width + "px";
  grid.style.height = height + "px";
  grid.style.pointerEvents = "none";
  grid.style.backgroundImage = `linear-gradient(to right, rgba(18,0,18,0.1) 1px, transparent 0.1px),
      linear-gradient(to bottom, rgba(18,0,18,0.1) 1px, transparent 0.1px)`;
  grid.style.backgroundSize = "25px 25px";
  grid.style.zIndex = "-1";

  const overlayItem = new window.NutrientViewer.CustomOverlayItem({
    id: "grid-overlay",
    node: grid,
    pageIndex,
    position: new window.NutrientViewer.Geometry.Point({ x: 0, y: 0 }),
  });

  instance.setCustomOverlayItem(overlayItem);
}
