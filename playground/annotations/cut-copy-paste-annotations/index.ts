import type { ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  enableClipboardActions: true,
}).then((instance) => {
  // Clipboard actions
  const copy: ToolbarItem = {
    type: "custom",
    title: "Copy",
    onPress: async () => {
      const event = /(Mac)/i.test(navigator.platform)
        ? new KeyboardEvent("keydown", { key: "c", metaKey: true })
        : new KeyboardEvent("keydown", { key: "c", ctrlKey: true });
      document.dispatchEvent(event);
    },
  };

  const paste: ToolbarItem = {
    type: "custom",
    title: "Paste",
    onPress: async () => {
      const event = /(Mac)/i.test(navigator.platform)
        ? new KeyboardEvent("keydown", { key: "v", metaKey: true })
        : new KeyboardEvent("keydown", { key: "v", ctrlKey: true });
      document.dispatchEvent(event);
    },
  };

  const cut: ToolbarItem = {
    type: "custom",
    title: "Cut",
    onPress: async () => {
      const event = /(Mac)/i.test(navigator.platform)
        ? new KeyboardEvent("keydown", { key: "x", metaKey: true })
        : new KeyboardEvent("keydown", { key: "x", ctrlKey: true });
      document.dispatchEvent(event);
    },
  };

  instance.setToolbarItems((items) => {
    items.push(cut);
    items.push(paste);
    items.push(copy);
    items.push({ type: "comment" });
    return items;
  });

  let isProcessingPaste = false; // Declared outside to persist across events

  document.addEventListener("paste", async (event) => {
    if (isProcessingPaste) return;

    isProcessingPaste = true;

    try {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      const item = items[0]; // Only processing the first clipboard item

      const contentType = item.type;
      const currentPage = instance.viewState.currentPageIndex;

      if (item.kind === "file" && item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (!file) return;

        const imageAttachmentId = await instance.createAttachment(file);
        const annotation =
          new window.NutrientViewer.Annotations.ImageAnnotation({
            pageIndex: currentPage,
            contentType: contentType,
            imageAttachmentId,
            description: "Pasted Image Annotation",
            boundingBox: new window.NutrientViewer.Geometry.Rect({
              left: 10,
              top: 50,
              width: 150,
              height: 150,
            }),
          });
        await instance.create(annotation);
      } else if (item.kind === "string") {
        item.getAsString(async (pastedText: string) => {
          const textAnnotation =
            new window.NutrientViewer.Annotations.TextAnnotation({
              pageIndex: currentPage,
              fontSize: 10,
              strokeColor: window.NutrientViewer.Color.GREEN,
              fontColor: window.NutrientViewer.Color.BLUE,
              text: {
                format: "plain",
                value: pastedText,
              },
              boundingBox: new window.NutrientViewer.Geometry.Rect({
                left: 10,
                top: 50,
                width: 150,
                height: 50,
              }),
            });
          await instance.create(textAnnotation);
        });
      } else {
        console.log("Unsupported clipboard item");
      }
    } finally {
      isProcessingPaste = false;
    }
  });
});
