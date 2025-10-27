import { useEffect, useRef } from "react";

interface PdfViewerComponentProps {
  document: string;
}

export default function PdfViewerComponent(props: PdfViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  let instance: any;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const PSPDFKit = window.PSPDFKit;
    if (!PSPDFKit) {
      console.error('PSPDFKit not loaded. Make sure the CDN script is included.');
      return;
    }

    (async () => {
      PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

      const defaultToolbarItems = PSPDFKit.defaultDocumentEditorToolbarItems;

      // Insert custom item at the desired position
      const toolbarItems = [...defaultToolbarItems];

      instance = await PSPDFKit.load({
        container,
        document: props.document,
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.4.0/",
        documentEditorToolbarItems: toolbarItems,
      });

      let isProcessingPaste = false;

      const handlePaste = async (event: ClipboardEvent) => {
        if (isProcessingPaste) return;
        isProcessingPaste = true;

        try {
          const items = event.clipboardData?.items;
          if (!items || items.length === 0) return;
          
          const item = items[0]; // this will get only the last copied data from clipboard

          const content_Type = item.type;
          const currentPage = instance.viewState.currentPageIndex;

          if (item.kind === "file" && item.type.startsWith("image")) {
            const file = item.getAsFile();
            if (!file) return;
            
            const imageAttachmentId = await instance.createAttachment(file);
            const annotation = new PSPDFKit.Annotations.ImageAnnotation({
              pageIndex: currentPage,
              contentType: content_Type,
              imageAttachmentId,
              description: "Pasted Image Annotation",
              boundingBox: new PSPDFKit.Geometry.Rect({
                left: 10,
                top: 50,
                width: 150,
                height: 150,
              }),
            });
            await instance.create(annotation);
          } else if (item.kind === "string") {
            item.getAsString(async (pastedText: string) => {
              // Here you can create a text annotation if needed
              const textAnnotation = new PSPDFKit.Annotations.TextAnnotation({
                pageIndex: currentPage,
                text: {
                  format: "plain",
                  value: pastedText,
                },
                boundingBox: new PSPDFKit.Geometry.Rect({
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
      };

      document.addEventListener("paste", handlePaste);

      // Cleanup event listener on component unmount
      return () => {
        document.removeEventListener("paste", handlePaste);
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}

