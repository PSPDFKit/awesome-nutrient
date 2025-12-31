import type {
  InlineTextSelectionToolbarItem,
  Instance,
  Rect,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
}).then((instance: Instance) => {
  const buttonNode = document.createElement("div");
  buttonNode.innerHTML = `
    <button 
      type="button"
      title="Link"
      aria-label="Link"
      aria-pressed="false"
      style="background: none; border: none; cursor: pointer; padding: 4px;">
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.1219 10.59C14.4482 10.9143 14.7071 11.2999 14.8837 11.7247C15.0604 12.1494 15.1513 12.6049 15.1513 13.065C15.1513 13.525 15.0604 13.9805 14.8837 14.4052C14.7071 14.83 14.4482 15.2156 14.1219 15.54L10.5919 19.07C10.2668 19.4038 9.87801 19.6691 9.44864 19.8503C9.01927 20.0315 8.55796 20.1248 8.09193 20.1248C7.6259 20.1248 7.16459 20.0315 6.73522 19.8503C6.30585 19.6691 5.91711 19.4038 5.59193 19.07C5.2581 18.7448 4.99277 18.356 4.81161 17.9267C4.63045 17.4973 4.53711 17.036 4.53711 16.57C4.53711 16.1039 4.63045 15.6426 4.81161 15.2133C4.99277 14.7839 5.2581 14.3951 5.59193 14.07L7.41193 12.35" stroke="currentColor" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round"></path>
        <path d="M11.3019 13.4099C10.9756 13.0856 10.7167 12.7 10.5401 12.2752C10.3634 11.8505 10.2725 11.395 10.2725 10.9349C10.2725 10.4749 10.3634 10.0194 10.5401 9.59467C10.7167 9.16992 10.9756 8.78428 11.3019 8.45994L14.8319 4.92994C15.1571 4.59611 15.5458 4.33079 15.9752 4.14962C16.4045 3.96846 16.8658 3.87512 17.3319 3.87512C17.7979 3.87512 18.2592 3.96846 18.6886 4.14962C19.118 4.33079 19.5067 4.59611 19.8319 4.92994C20.1657 5.25512 20.431 5.64386 20.6122 6.07323C20.7934 6.50261 20.8867 6.96391 20.8867 7.42994C20.8867 7.89597 20.7934 8.35728 20.6122 8.78665C20.431 9.21603 20.1657 9.60477 19.8319 9.92994L18.0119 11.6499" stroke="currentColor" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round"></path>
      </svg>
    </button>`;

  const highlightWithLink: InlineTextSelectionToolbarItem = {
    type: "custom",
    id: "highlight-link",
    title: "Link",
    node: buttonNode,
    onPress: async () => {
      const selectedText = instance.getTextSelection();
      if (!selectedText) return;

      const rectsPerPage = await selectedText.getSelectedRectsPerPage();
      const firstPageSelection = rectsPerPage.get(0);
      if (!firstPageSelection) return;

      const { rects, pageIndex } = firstPageSelection;

      const highlightRects = rects.map((rect: Rect) => {
        const adjustedRect = rect.translateY(-5);
        return adjustedRect
          .set("height", rect.height - 10)
          .set("top", rect.top + 8);
      });

      const underlineRects = rects.map((rect: Rect) => {
        return rect.set("height", rect.height);
      });

      const highlight =
        new window.NutrientViewer.Annotations.HighlightAnnotation({
          pageIndex: pageIndex,
          rects: highlightRects,
          boundingBox: window.NutrientViewer.Geometry.Rect.union(rects),
          color: window.NutrientViewer.Color.YELLOW,
          blendMode: "multiply",
          opacity: 0.5,
        });

      const underline =
        new window.NutrientViewer.Annotations.UnderlineAnnotation({
          pageIndex: pageIndex,
          rects: underlineRects,
          boundingBox: window.NutrientViewer.Geometry.Rect.union(rects),
          color: window.NutrientViewer.Color.BLUE,
          blendMode: "multiply",
          opacity: 0.9,
        });

      const linkAnnotation =
        new window.NutrientViewer.Annotations.LinkAnnotation({
          pageIndex: pageIndex,
          boundingBox: window.NutrientViewer.Geometry.Rect.union(rects),
          action: new window.NutrientViewer.Actions.URIAction({
            uri: "https://nutrient.io",
          }),
          borderColor: window.NutrientViewer.Color.TRANSPARENT,
          blendMode: "multiply",
        });

      await instance.create([linkAnnotation, underline, highlight]);
    },
  };

  instance.setInlineTextSelectionToolbarItems((toolbarOptions) => {
    const { defaultItems } = toolbarOptions;
    return [...defaultItems, highlightWithLink];
  });
});
