import { useEffect, useRef, useState } from "react";

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  let PSPDFKit, instance;

  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      PSPDFKit = await import("pspdfkit");

      if (container) {
        PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.
      }

      const toolbarItemsDefault = PSPDFKit.defaultToolbarItems;

      instance = null;
      const customUIConfiguration = {
        [PSPDFKit.UIElement.Sidebar]: {
          [PSPDFKit.SidebarMode.ANNOTATIONS]: ({ containerNode }) => ({
            node: containerNode,
            onRenderItem: ({ item: annotation, itemContainerNode }) => {
              if (annotation instanceof PSPDFKit.Annotations.HighlightAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              } 
              if (annotation instanceof PSPDFKit.Annotations.CommentMarkerAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.InkAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.MarkupAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  console.log("Text from Squiggle Annotation", text);
                  itemContainerNode.querySelector("button").textContent = text;
                });
              } 
              //link Annotation cannot give the text of the Rect.
              if (annotation instanceof PSPDFKit.Annotations.LineAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.MarkupAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.MediaAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.NoteAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.MarkupAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.PolygonAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.RectangleAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.RedactionAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.ShapeAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.SquiggleAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.StampAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.StrikeOutAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.TextAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.UnderlineAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.UnknownAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
              if (annotation instanceof PSPDFKit.Annotations.WidgetAnnotation && instance) {
                instance.getTextFromRects(annotation.pageIndex, annotation.rects).then((text) => {
                  itemContainerNode.querySelector("button").textContent = text;
                });
              }
            },
          }),
        },
      };

      instance = await PSPDFKit.load({
        container,
        document: props.document,
        customUI: customUIConfiguration,
        baseUrl: `${window.location.protocol}//${window.location.host}/${import.meta.env.PUBLIC_URL || ""}`,
        toolbarItems: [...toolbarItemsDefault, { type: "comment" }],
        initialViewState: new PSPDFKit.ViewState({
          sidebarMode: PSPDFKit.SidebarMode.ANNOTATIONS,
        }),
      });

      instance.setViewState((viewState) =>
        viewState.set("sidebarOptions", {
          [PSPDFKit.SidebarMode.ANNOTATIONS]: {
            includeContent: [
              ...PSPDFKit.defaultAnnotationsSidebarContent,
              PSPDFKit.Comment,
            ],
          },
        })
      ),
      console.log("PSPDFKit for Web successfully loaded!", instance);

      instance.addEventListener("textSelection.change", async (textSelection) => {
        if (textSelection) {
          const text = await textSelection.getText();
          console.log("Selected text:", text);
          console.log("Text length:", text.length);
        } else {
          console.log("No text is selected");
        }
      });

      // Cleanup event listener and unload PSPDFKit on component unmount
      return () => {
        if (instance) {
          instance.removeEventListener("textSelection.change");
          PSPDFKit.unload(container);
        }
      };
    })();
  }, [props.document]);

   return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
