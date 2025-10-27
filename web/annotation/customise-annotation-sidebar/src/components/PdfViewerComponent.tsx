import { useEffect, useRef } from "react";

interface PdfViewerComponentProps {
  document: string;
}

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

    let instance: any = null;

    (async () => {
      if (container) {
        PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.
      }

      const toolbarItemsDefault = PSPDFKit.defaultToolbarItems;

      const customUIConfiguration = {
        [PSPDFKit.UIElement.Sidebar]: {
          [PSPDFKit.SidebarMode.ANNOTATIONS]: ({ containerNode }: any) => ({
            node: containerNode,
            onRenderItem: ({ item: annotation, itemContainerNode }: any) => {
              if (
                annotation instanceof
                  PSPDFKit.Annotations.HighlightAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  PSPDFKit.Annotations.CommentMarkerAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.InkAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    console.log("Text from Squiggle Annotation", text);
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              //link Annotation cannot give the text of the Rect.
              if (
                annotation instanceof PSPDFKit.Annotations.LineAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.MediaAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.NoteAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.PolygonAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  PSPDFKit.Annotations.RectangleAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  PSPDFKit.Annotations.RedactionAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.ShapeAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.SquiggleAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.StampAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  PSPDFKit.Annotations.StrikeOutAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.TextAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  PSPDFKit.Annotations.UnderlineAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.UnknownAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof PSPDFKit.Annotations.WidgetAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
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
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.7.0/",
        toolbarItems: [...toolbarItemsDefault, { type: "comment" }],
        initialViewState: new PSPDFKit.ViewState({
          sidebarMode: PSPDFKit.SidebarMode.ANNOTATIONS,
        }),
      });

      instance.setViewState((viewState: any) =>
        viewState.set("sidebarOptions", {
          [PSPDFKit.SidebarMode.ANNOTATIONS]: {
            includeContent: [
              ...PSPDFKit.defaultAnnotationsSidebarContent,
              PSPDFKit.Comment,
            ],
          },
        }),
      ),
        console.log("Nutrient Web SDK successfully loaded!", instance);

      instance.addEventListener(
        "textSelection.change",
        async (textSelection: any) => {
          if (textSelection) {
            const text = await textSelection.getText();
            console.log("Selected text:", text);
            console.log("Text length:", text.length);
          } else {
            console.log("No text is selected");
          }
        },
      );

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

