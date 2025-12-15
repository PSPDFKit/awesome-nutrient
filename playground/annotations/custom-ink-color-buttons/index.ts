import type { Color, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Initialize window.NutrientViewer with custom configuration
window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance) => {
  // SVG template for pen icon - used for both red and blue pens
  const PEN_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       fill="currentColor"
       class="bi bi-pen"
       viewBox="0 0 16 16">
    <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
  </svg>`;

  // Creates a pen icon DOM node with specified color
  function createPenIconNode(color: string): HTMLDivElement {
    const node = document.createElement("div");
    node.innerHTML = PEN_ICON_SVG.replace("currentColor", color);
    node.querySelector("path")?.setAttribute("fill", color);
    const svg = node.querySelector("svg");
    if (svg) {
      svg.style.color = color;
    }
    return node;
  }

  // Creates a custom toolbar item
  function createInkToolbarItem(
    title: string,
    node: HTMLDivElement,
    color: Color,
  ): ToolbarItem {
    return {
      type: "custom",
      title,
      node,
      onPress: async () => {
        const { interactionMode } = instance.viewState;

        if (interactionMode === "INK" || interactionMode === null) {
          // Disable current interaction mode
          instance.setViewState((viewState) =>
            viewState.set("interactionMode", null),
          );

          // Update ink preset with selected color
          instance.setAnnotationPresets((presets) => ({
            ...presets,
            ink: {
              ...presets.ink,
              strokeColor: color,
            },
          }));

          // Enable ink mode with new color
          instance.setCurrentAnnotationPreset("ink");
          instance.setViewState((viewState) =>
            viewState.set(
              "interactionMode",
              window.NutrientViewer.InteractionMode.INK,
            ),
          );
        } else {
          // Disable interaction mode
          instance.setViewState((viewState) =>
            viewState.set("interactionMode", null),
          );
        }
      },
    };
  }

  // Create pen icon nodes for each color
  const redPenNode = createPenIconNode("red");
  const bluePenNode = createPenIconNode("blue");

  // Create toolbar items for red and blue ink
  const redInkTool = createInkToolbarItem(
    "Red Ink",
    redPenNode,
    window.NutrientViewer.Color.RED,
  );
  const blueInkTool = createInkToolbarItem(
    "Blue Ink",
    bluePenNode,
    window.NutrientViewer.Color.BLUE,
  );

  // Add custom tools to toolbar next to the default ink tool
  instance.setToolbarItems((items) =>
    items.reduce<ToolbarItem[]>(
      (toolbar, item) =>
        item.type === "ink"
          ? [...toolbar, item, redInkTool, blueInkTool]
          : [...toolbar, item],
      [],
    ),
  );
});
