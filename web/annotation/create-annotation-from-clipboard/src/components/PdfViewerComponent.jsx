import { useEffect, useRef } from "react";

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const NutrientViewer = window.NutrientViewer;

    if (!NutrientViewer) {
      console.error("NutrientViewer SDK not loaded");
      return;
    }

    // Cleanup any existing instance
    NutrientViewer.unload(container);

    const loadViewer = async () => {
      const defaultToolbarItems = NutrientViewer.defaultDocumentEditorToolbarItems;
      const toolbarItems = [...defaultToolbarItems];

      instanceRef.current = await NutrientViewer.load({
        container,
        document: props.document,
        documentEditorToolbarItems: toolbarItems,
      });

      let isProcessingPaste = false;

      const handlePaste = async (event) => {
        if (isProcessingPaste || !instanceRef.current) return;
        isProcessingPaste = true;

        try {
          const items = (event.clipboardData || event.originalEvent.clipboardData).items;
          const item = items[0];
          const contentType = item.type;
          const currentPage = instanceRef.current.viewState.currentPageIndex;

          if (item.kind === "file" && item.type.startsWith("image")) {
            const file = item.getAsFile();
            const imageAttachmentId = await instanceRef.current.createAttachment(file);
            const annotation = new NutrientViewer.Annotations.ImageAnnotation({
              pageIndex: currentPage,
              contentType,
              imageAttachmentId,
              description: "Pasted Image Annotation",
              boundingBox: new NutrientViewer.Geometry.Rect({
                left: 10,
                top: 50,
                width: 150,
                height: 150,
              }),
            });
            await instanceRef.current.create(annotation);
          } else if (item.kind === "string") {
            item.getAsString(async (pastedText) => {
              const textAnnotation = new NutrientViewer.Annotations.TextAnnotation({
                pageIndex: currentPage,
                text: { format: "plain", value: pastedText },
                boundingBox: new NutrientViewer.Geometry.Rect({
                  left: 10,
                  top: 50,
                  width: 150,
                  height: 50,
                }),
              });
              await instanceRef.current.create(textAnnotation);
            });
          }
        } finally {
          isProcessingPaste = false;
        }
      };

      document.addEventListener("paste", handlePaste);

      return () => {
        document.removeEventListener("paste", handlePaste);
      };
    };

    loadViewer();

    return () => {
      NutrientViewer.unload(container);
    };
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
