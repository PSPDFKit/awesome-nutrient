//PdfViewerComponent.jsx
import { useEffect, useRef } from "react";
import "pspdfkit";

let PSPDFKit, instance;
var allAnnotations = []; // push all the annotation bounding box and pageindex and annotation numbers
let pageIndex; // store the page index
var currentAnnotationIndex = 0; // know the current annotation and scroll to next annotation
const lkey ="Your license key here";
export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      PSPDFKit = await import("pspdfkit");

      PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

      const defaultToolbarItems = PSPDFKit.defaultDocumentEditorToolbarItems;
      const toolbarItems = [...defaultToolbarItems];
      
      instance = await PSPDFKit.load({
        licenseKey: lkey,
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${import.meta.env.PUBLIC_URL ?? ""}`,
        documentEditorToolbarItems: toolbarItems,
        enableRichText: () => true,
        enableClipboardActions: true, // this is used to cut copy and paste between pages (by default you cannot move annotation between pages)
      });
      // Enable Content Editor
      // instance.setViewState((v) =>
      //   v.set("interactionMode", PSPDFKit.InteractionMode.CONTENT_EDITOR)
      // );
      //end of Enable content editor
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
          currentAnnotationIndex = currentAnnotationIndex +1;
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
// End of the code to cut copy and paste the Annotations between pages - button in toolbar

// the following code is the paste event (which copies from clipboard and creates annotation based on text or image copied) 
// the above copy paste and this one is different.
      document.addEventListener('paste', async (event) => {
        const isProcessingPaste = false;
        if (isProcessingPaste) return;

        try {
          const items = (event.clipboardData || event.originalEvent.clipboardData).items;
          const item = items[0]; // this will get only the last copied data from clipboard

          const content_Type = item.type;
          const currentPage = instance.viewState.currentPageIndex;

          if (item.kind === 'file' && item.type.startsWith('image')) {
            const file = item.getAsFile();
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
                height: 150
              })
            });
            await instance.create(annotation);
          } else if (item.kind === 'string') {
            item.getAsString(async (pastedText) => {
              const textAnnotation = new PSPDFKit.Annotations.TextAnnotation({
                pageIndex: currentPage,
                text: {
                  format: "plain",
                  value: pastedText
                },
                boundingBox: new PSPDFKit.Geometry.Rect({
                  left: 10,
                  top: 50,
                  width: 150,
                  height: 50
                })
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
// End of the code for paste event (which copies from clipboard and creates annotation based on text or image copied) 
// Image annotation has some limitations of image types - please try it out and explore.

      return () => {
        document.removeEventListener('paste', handlePaste);
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
    let tpage = instance.totalPageCount;
    console.log("Total Pages", tpage);
    let i = 0;
    for (let j = 0; j < tpage; j++) {
      let annotations = await instance.getAnnotations(j); // Assuming pageIndex is 0
      pageIndex = j;
      for (const annotation of annotations) {
        i = i + 1;
        const { bottom, left, right, top } = annotation.boundingBox;
        const width = right - left;
        const height = bottom - top;  
        allAnnotations.push({
          bottom, right, top, left, width, height, pageIndex, i
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
    console.log("currentAnnotationIndex is : ",currentAnnotationIndex);
    let highlightannotID;
    var light_red = new PSPDFKit.Color({r:247, g:141, b:138});
    if (allAnnotations === undefined || allAnnotations.length === 0)
      {
        fetchAnnotationCoordinates();
        currentAnnotationIndex = 0;
      }
    if (allAnnotations.length === currentAnnotationIndex)
      {
          currentAnnotationIndex = 0;
      }
    if(allAnnotations.length > 0)
      {
    const annotation = allAnnotations[currentAnnotationIndex];
    console.log("Current Annotation: ", annotation);
      const bBox = new PSPDFKit.Geometry.Rect({
        left: annotation.left, // you calculation goes here for level of zoom needed
        top: annotation.top, // you calculation goes here for level of zoom needed
        width: (annotation.width+100), // you calculation goes here for level of zoom needed
        height: (annotation.height+100) // you calculation goes here for level of zoom needed
      });
      const bBoxhighlight = new PSPDFKit.Geometry.Rect({
        left: annotation.left,
        top: annotation.top, 
        width: (annotation.width), 
        height: (annotation.height) 
      });
      highlightannotID = await instance.create(
        new PSPDFKit.Annotations.RectangleAnnotation({
          pageIndex: annotation.pageIndex,
          boundingBox: bBoxhighlight,
          "strokeWidth": 1,
          "strokeColor": light_red,
          "opacity": 1,
        }));
      //instance.jumpAndZoomToRect(annotation.pageIndex, bBoxhighlight); // This will zoom to the annotation. 
        instance.jumpToRect(annotation.pageIndex, bBoxhighlight); // you can use this if you don't want to zoom and just focus on the annotation. 
      setTimeout(async() => { await instance.delete(highlightannotID); }, 3000);
    }
  };
 //End of Get the next annotation - button available on the tool bar right corner
  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
}
