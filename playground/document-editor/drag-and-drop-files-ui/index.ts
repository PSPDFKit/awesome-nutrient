import type {
  DocumentEditorFooterItem,
  Instance,
  ViewState,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Drag and drop PDFs in document editor footer to import

let _instance: Instance | null = null;
let fileArray: File | null = null;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance: Instance) => {
  _instance = instance;

  // Add a custom document editor footer item
  instance.setDocumentEditorFooterItems((items: DocumentEditorFooterItem[]) => {
    // Create a custom node for drag and drop
    const dropZoneNode = document.createElement("div");
    dropZoneNode.innerHTML = "Drop PDF here";

    // Find the index of the cancel button
    const cancelIndex = items.findIndex((item) => item.type === "cancel");

    const customItem: DocumentEditorFooterItem = {
      type: "custom",
      id: "pdf-drop-zone",
      node: dropZoneNode,
      onPress: (
        _event: Event,
        documentEditorUIHandler?: {
          setOperations: (
            callback: (operations: any) => any,
            clearPagesSelection?: boolean,
          ) => void | Promise<void>;
          getSelectedPageIndexes: () => number[];
        },
      ) => {
        if (fileArray && documentEditorUIHandler) {
          documentEditorUIHandler.setOperations(
            (operations: any) =>
              operations.push({
                type: "importDocument",
                beforePageIndex: 0,
                treatImportedDocumentAsOnePage: false,
                document: fileArray,
              }),
            true,
          );
          fileArray = null;
        } else {
          alert("Drag a file to import");
        }
      },
    };

    // Remove the spacer divs that might be taking up space
    const filteredItems = items.filter((item) => {
      if (item.type === "custom" && !item.id && item.node) {
        const element = item.node as HTMLElement;
        return !(
          element.className && element.className.includes("BaselineUI-Box")
        );
      }
      return true;
    });

    // Insert the custom item after the cancel button
    if (cancelIndex !== -1) {
      filteredItems.splice(cancelIndex + 1, 0, customItem);
    } else {
      filteredItems.unshift(customItem);
    }

    return filteredItems;
  });

  instance.addEventListener(
    "viewState.change",
    (viewState: ViewState, _previousViewState: ViewState) => {
      if (
        viewState.get("interactionMode") ===
        window.NutrientViewer.InteractionMode.DOCUMENT_EDITOR
      ) {
        setTimeout(() => {
          if (!instance.contentDocument) return;

          const dropPdfHereNode = instance.contentDocument.querySelector(
            "#pdf-drop-zone",
          ) as HTMLElement | null;

          if (dropPdfHereNode) {
            // Apply styling to the drop zone
            dropPdfHereNode.style.padding = "8px 16px";
            dropPdfHereNode.style.margin = "0 10px";
            dropPdfHereNode.style.border =
              "2px dashed var(--bui-color-text-primary)";
            dropPdfHereNode.style.background =
              "var(--bui-color-background-secondary-subtle)";
            dropPdfHereNode.style.color = "var(--bui-color-text-primary)";
            dropPdfHereNode.style.borderRadius = "4px";
            dropPdfHereNode.style.flexGrow = "10";
            dropPdfHereNode.style.justifyContent = "center";
            handleDragAndDrop(dropPdfHereNode);
          }
        }, 100);
      }
    },
  );
});

// Function to handle file processing
function handleFiles(files: FileList): void {
  console.log(files);

  // Find and click the button element
  if (_instance && _instance.contentDocument) {
    const dropZoneElement = _instance.contentDocument.getElementById(
      "pdf-drop-zone",
    ) as HTMLElement | null;

    if (dropZoneElement) {
      Array.from(files).forEach((file: File) => {
        fileArray = file;
        dropZoneElement.click();
      });
    }
  }
}

// Function to add drag and drop capabilities to nodes
function handleDragAndDrop(dropZone: HTMLElement): void {
  // Prevent default behavior on dragover and dragenter to allow drop
  dropZone.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault();
    dropZone.style.border =
      "2px dashed var(--bui-color-support-success-medium)";
  });

  dropZone.addEventListener("dragenter", (event: DragEvent) => {
    event.preventDefault();
    dropZone.style.border =
      "2px dashed var(--bui-color-support-success-medium)";
  });

  dropZone.addEventListener("dragleave", (event: DragEvent) => {
    event.preventDefault();
    // Reset styling when no longer dragging over
    dropZone.style.border = "2px dashed var(--bui-color-text-primary)";
  });

  // Handle the drop event
  dropZone.addEventListener("drop", (event: DragEvent) => {
    event.preventDefault();
    dropZone.style.border = "2px dashed var(--bui-color-text-primary)";

    // Access the dropped files from the DataTransfer object
    const files = event.dataTransfer?.files;
    if (files) {
      handleFiles(files);
    }
  });
}
