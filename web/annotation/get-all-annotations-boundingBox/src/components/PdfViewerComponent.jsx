//PdfViewerComponent.jsx
import { useEffect, useRef } from "react";

// Wait for SDK to be available on window (injected by playground)
const waitForSDK = () => {
  return new Promise((resolve) => {
    if (window.NutrientViewer) {
      resolve(window.NutrientViewer);
      return;
    }
    const check = setInterval(() => {
      if (window.NutrientViewer) {
        clearInterval(check);
        resolve(window.NutrientViewer);
      }
    }, 50);
  });
};

let NutrientViewer;
let instance;
let allAnnotations = [];
let pageIndex;
let currentAnnotationIndex = 0;

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let pasteHandler = null;

    (async () => {
      NutrientViewer = await waitForSDK();

      try {
        NutrientViewer.unload(container);
      } catch (e) {
        // Ignore if nothing to unload
      }

      const defaultToolbarItems = NutrientViewer.defaultDocumentEditorToolbarItems;
      const toolbarItems = [...defaultToolbarItems];

      instance = await NutrientViewer.load({
        container,
        document: props.document,
        documentEditorToolbarItems: toolbarItems,
        enableRichText: () => true,
        enableClipboardActions: true,
      });

      const copy = {
        type: "custom",
        title: "Copy",
        onPress: async () => {
          const event = /(Mac)/i.test(navigator.platform)
            ? new KeyboardEvent("keydown", { key: "c", metaKey: true })
            : new KeyboardEvent("keydown", { key: "c", ctrlKey: true });
          document.dispatchEvent(event);
        },
      };

      const paste = {
        type: "custom",
        title: "Paste",
        onPress: async () => {
          const event = /(Mac)/i.test(navigator.platform)
            ? new KeyboardEvent("keydown", { key: "v", metaKey: true })
            : new KeyboardEvent("keydown", { key: "v", ctrlKey: true });
          document.dispatchEvent(event);
        },
      };

      const cut = {
        type: "custom",
        title: "Cut",
        onPress: async () => {
          const event = /(Mac)/i.test(navigator.platform)
            ? new KeyboardEvent("keydown", { key: "x", metaKey: true })
            : new KeyboardEvent("keydown", { key: "x", ctrlKey: true });
          document.dispatchEvent(event);
        },
      };

      const nextAnnotation = {
        type: "custom",
        title: "Next Annotation",
        onPress: async () => {
          currentAnnotationIndex = currentAnnotationIndex + 1;
          handleNextAnnotation();
        },
      };

      instance.setToolbarItems((items) => {
        items.push(cut);
        items.push(paste);
        items.push(copy);
        items.push(nextAnnotation);
        return items;
      });

      pasteHandler = async (event) => {
        let isProcessingPaste = false;
        if (isProcessingPaste) return;

        try {
          const items = (
            event.clipboardData || event.originalEvent.clipboardData
          ).items;
          const item = items[0];

          const content_Type = item.type;
          const currentPage = instance.viewState.currentPageIndex;

          if (item.kind === "file" && item.type.startsWith("image")) {
            const file = item.getAsFile();
            const imageAttachmentId = await instance.createAttachment(file);
            const annotation = new NutrientViewer.Annotations.ImageAnnotation({
              pageIndex: currentPage,
              contentType: content_Type,
              imageAttachmentId,
              description: "Pasted Image Annotation",
              boundingBox: new NutrientViewer.Geometry.Rect({
                left: 10,
                top: 50,
                width: 150,
                height: 150,
              }),
            });
            await instance.create(annotation);
          } else if (item.kind === "string") {
            item.getAsString(async (pastedText) => {
              const textAnnotation = new NutrientViewer.Annotations.TextAnnotation({
                pageIndex: currentPage,
                text: {
                  format: "plain",
                  value: pastedText,
                },
                boundingBox: new NutrientViewer.Geometry.Rect({
                  left: 10,
                  top: 50,
                  width: 150,
                  height: 50,
                }),
              });
              await instance.create(textAnnotation);
            });
          }
        } finally {
          isProcessingPaste = false;
        }
      };

      document.addEventListener("paste", pasteHandler);
    })();

    return () => {
      if (pasteHandler) {
        document.removeEventListener("paste", pasteHandler);
      }
      if (NutrientViewer && container) {
        try {
          NutrientViewer.unload(container);
        } catch (e) {}
      }
    };
  }, [props.document]);

  useEffect(() => {
    if (props.handleAnnotation === "get") {
      allAnnotations = [];
      fetchAnnotationCoordinates();
    }
  }, [props.handleAnnotation]);

  const fetchAnnotationCoordinates = async () => {
    const tpage = instance.totalPageCount;
    let i = 0;
    for (let j = 0; j < tpage; j++) {
      const annotations = await instance.getAnnotations(j);
      pageIndex = j;
      for (const annotation of annotations) {
        i = i + 1;
        const { bottom, left, right, top } = annotation.boundingBox;
        const width = right - left;
        const height = bottom - top;
        allAnnotations.push({ bottom, right, top, left, width, height, pageIndex, i });
      }
    }
  };

  const handleNextAnnotation = async () => {
    let highlightannotID;
    const light_red = new NutrientViewer.Color({ r: 247, g: 141, b: 138 });
    if (!allAnnotations || allAnnotations.length === 0) {
      fetchAnnotationCoordinates();
      currentAnnotationIndex = 0;
    }
    if (allAnnotations.length === currentAnnotationIndex) {
      currentAnnotationIndex = 0;
    }
    if (allAnnotations.length > 0) {
      const annotation = allAnnotations[currentAnnotationIndex];
      const bBoxhighlight = new NutrientViewer.Geometry.Rect({
        left: annotation.left,
        top: annotation.top,
        width: annotation.width,
        height: annotation.height,
      });
      highlightannotID = await instance.create(
        new NutrientViewer.Annotations.RectangleAnnotation({
          pageIndex: annotation.pageIndex,
          boundingBox: bBoxhighlight,
          strokeWidth: 1,
          strokeColor: light_red,
          opacity: 1,
        }),
      );
      instance.jumpToRect(annotation.pageIndex, bBoxhighlight);
      setTimeout(async () => {
        await instance.delete(highlightannotID);
      }, 3000);
    }
  };

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
