import type { Instance, ViewState } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "content-editor" },
  ],
}).then((instance: Instance) => {
  let isContentEditorActive = false;
  let clickListenerAdded = false;

  // Function to add button click detection
  function addButtonClickDetection() {
    if (!instance.contentDocument || clickListenerAdded) return;

    // Add event listener to detect button clicks in content editor
    instance.contentDocument.addEventListener(
      "click",
      (event: Event) => {
        if (!isContentEditorActive) return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        const button = target.closest("button");
        if (!button) return;

        const buttonText = button.textContent || button.innerText || "";

        // Check for Cancel button
        if (buttonText.trim() === "Cancel") {
          console.log("Cancel button clicked");
        }

        // Check for Save & Close button
        if (buttonText.includes("Save") && buttonText.includes("Close")) {
          console.log("Save & Close button clicked");
        }
      },
      true,
    );

    clickListenerAdded = true;
  }

  // Monitor view state changes
  instance.addEventListener(
    "viewState.change",
    (viewState: ViewState, previousViewState: ViewState) => {
      const currentMode = viewState.toJS().interactionMode;
      const previousMode = previousViewState.toJS().interactionMode;

      if (currentMode === "CONTENT_EDITOR") {
        console.log("Content Editor opened");
        isContentEditorActive = true;

        // Add button click detection
        setTimeout(addButtonClickDetection, 500);
      } else if (previousMode === "CONTENT_EDITOR") {
        console.log("Content Editor closed");
        isContentEditorActive = false;
      }
    },
  );
});
