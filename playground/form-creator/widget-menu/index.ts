import type { Instance, ViewState } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Custom floating menu for Form Creator with quick access to all widget types

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "form-creator" },
  ],
}).then((instance: Instance) => {
  attachFormCreatorListener(instance);
});

function attachFormCreatorListener(instance: Instance) {
  const doc = instance.contentDocument;
  const button = doc.querySelector(
    ".NutrientViewer-Toolbar-Button-Form-Creator",
  );
  if (!button) return;

  const OVERLAY_ID = "form-creator-floating";

  function renderFloating() {
    const old = document.getElementById(OVERLAY_ID);
    if (old) old.remove();

    if (!button || button.getAttribute("aria-pressed") !== "true") return;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.style.cssText =
      "position:fixed;display:flex;flex-wrap:wrap;gap:4px;" +
      "background:rgba(0,0,0,0.7);padding:8px;border-radius:4px;" +
      "font-family:sans-serif;color:white;z-index:10000;";

    const modes = [
      {
        label: "Button",
        mode: window.NutrientViewer.InteractionMode.BUTTON_WIDGET,
      },
      {
        label: "Text",
        mode: window.NutrientViewer.InteractionMode.TEXT_WIDGET,
      },
      {
        label: "Checkbox",
        mode: window.NutrientViewer.InteractionMode.CHECKBOX_WIDGET,
      },
      {
        label: "Radio",
        mode: window.NutrientViewer.InteractionMode.RADIO_BUTTON_WIDGET,
      },
      {
        label: "Combo",
        mode: window.NutrientViewer.InteractionMode.COMBO_BOX_WIDGET,
      },
      {
        label: "List",
        mode: window.NutrientViewer.InteractionMode.LIST_BOX_WIDGET,
      },
      {
        label: "Signature",
        mode: window.NutrientViewer.InteractionMode.SIGNATURE_WIDGET,
      },
      {
        label: "Date",
        mode: window.NutrientViewer.InteractionMode.DATE_WIDGET,
      },
    ];

    modes.forEach((item) => {
      const btn = document.createElement("button");
      btn.textContent = item.label;
      btn.style.padding = "4px 8px";
      btn.addEventListener("click", () => {
        instance.setViewState((vs: ViewState) =>
          vs.set("interactionMode", item.mode),
        );
      });
      overlay.appendChild(btn);
    });

    const toolbar = doc.querySelector(".NutrientViewer-Toolbar");
    if (!toolbar) return;
    const r = toolbar.getBoundingClientRect();
    overlay.style.top = r.bottom + window.scrollY + "px";
    overlay.style.left = r.left + window.scrollX + "px";

    document.body.appendChild(overlay);
  }

  button.addEventListener("click", () => {
    setTimeout(renderFloating, 0);
  });
  instance.addEventListener("viewState.currentPageIndex.change", () => {
    setTimeout(renderFloating, 0);
  });
}
