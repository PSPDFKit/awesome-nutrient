//PdfViewerComponent.tsx
import { useEffect, useRef } from "react";

interface PdfViewerComponentProps {
  document: string;
  handleAnnotation: string;
}

interface AnnotationData {
  bottom: number;
  right: number;
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
  i: number;
}

let instance: any;
let allAnnotations: AnnotationData[] = []; // push all the annotation bounding box and pageindex and annotation numbers
let pageIndex: number; // store the page index
let currentAnnotationIndex = 0; // know the current annotation and scroll to next annotation
const lkey = "Your license key here";

export default function PdfViewerComponent(props: PdfViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      const toolbarItems = [...defaultToolbarItems];

      instance = await PSPDFKit.load({
        licenseKey: lkey,
        container,
        document: props.document,
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.4.0/",
        documentEditorToolbarItems: toolbarItems,
        enableRichText: () => true,
        enableClipboardActions: true, // this is used to cut copy and paste between pages (by default you cannot move annotation between pages)
      });

      // the following is the code to cut copy and paste the Annotations between pages - button in toolbar
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

      instance.setToolbarItems((items: any[]) => {
        items.push(cut);
        items.push(paste);
        items.push(copy);
        items.push(nextAnnotation);
        return items;
      });
      // End of the code to cut copy and paste the Annotations between pages - button in toolbar

      // the following code is the paste event (which copies from clipboard and creates annotation based on text or image copied)
      // the above copy paste and this one is different.
      const handlePaste = async (event: ClipboardEvent) => {
        let isProcessingPaste = false;
        if (isProcessingPaste) return;

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
      // End of the code for paste event (which copies from clipboard and creates annotation based on text or image copied)
      // Image annotation has some limitations of image types - please try it out and explore.

      return () => {
        document.removeEventListener("paste", handlePaste);
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]);

  // Fetched all annotations
  useEffect(() => {
    if (props.handleAnnotation === "get") {
      allAnnotations = [];
      fetchAnnotationCoordinates();
    }
  }, [props.handleAnnotation]);

  const fetchAnnotationCoordinates = async () => {
    const tpage = instance.totalPageCount;
    console.log("Total Pages", tpage);
    let i = 0;
    for (let j = 0; j < tpage; j++) {
      const annotations = await instance.getAnnotations(j); // Assuming pageIndex is 0
      pageIndex = j;
      for (const annotation of annotations) {
        i = i + 1;
        const { bottom, left, right, top } = annotation.boundingBox;
        const width = right - left;
        const height = bottom - top;
        allAnnotations.push({
          bottom,
          right,
          top,
          left,
          width,
          height,
          pageIndex,
          i,
        });
      }
    }
    //console.log("All annotations after pushing goes here: ", allAnnotations);
  };
  // End of Fetched all annotations

  //Get the next annotation - button available on the tool bar right corner
  const handleNextAnnotation = async () => {
    console.log("All Annotation length", allAnnotations.length);
    console.log("All Annotations", allAnnotations);
    console.log("currentAnnotationIndex is : ", currentAnnotationIndex);
    let highlightannotID;
    const PSPDFKit = window.PSPDFKit;
    const light_red = new PSPDFKit.Color({ r: 247, g: 141, b: 138 });
    if (allAnnotations === undefined || allAnnotations.length === 0) {
      fetchAnnotationCoordinates();
      currentAnnotationIndex = 0;
    }
    if (allAnnotations.length === currentAnnotationIndex) {
      currentAnnotationIndex = 0;
    }
    if (allAnnotations.length > 0) {
      const annotation = allAnnotations[currentAnnotationIndex];
      console.log("Current Annotation: ", annotation);
      const bBox = new PSPDFKit.Geometry.Rect({
        left: annotation.left, // you calculation goes here for level of zoom needed
        top: annotation.top, // you calculation goes here for level of zoom needed
        width: annotation.width + 100, // you calculation goes here for level of zoom needed
        height: annotation.height + 100, // you calculation goes here for level of zoom needed
      });
      const bBoxhighlight = new PSPDFKit.Geometry.Rect({
        left: annotation.left,
        top: annotation.top,
        width: annotation.width,
        height: annotation.height,
      });
      highlightannotID = await instance.create(
        new PSPDFKit.Annotations.RectangleAnnotation({
          pageIndex: annotation.pageIndex,
          boundingBox: bBoxhighlight,
          strokeWidth: 1,
          strokeColor: light_red,
          opacity: 1,
        }),
      );
      //instance.jumpAndZoomToRect(annotation.pageIndex, bBoxhighlight); // This will zoom to the annotation.
      instance.jumpToRect(annotation.pageIndex, bBoxhighlight); // you can use this if you don't want to zoom and just focus on the annotation.
      setTimeout(async () => {
        await instance.delete(highlightannotID);
      }, 3000);
    }
  };
  //End of Get the next annotation - button available on the tool bar right corner
  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
}

