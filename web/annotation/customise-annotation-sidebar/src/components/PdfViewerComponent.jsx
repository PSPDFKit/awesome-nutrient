import { useEffect, useRef, useState } from "react";


export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  let NutrientViewer;
  let instance;

  useEffect(() => {
    const container = containerRef.current;

    (async () => {
      NutrientViewer = window.NutrientViewer;

      if (container) {
      }

      const toolbarItemsDefault = NutrientViewer.defaultToolbarItems;

      instance = null;
      const customUIConfiguration = {
        [NutrientViewer.UIElement.Sidebar]: {
          [NutrientViewer.SidebarMode.ANNOTATIONS]: ({ containerNode }) => ({
            node: containerNode,
            onRenderItem: ({ item: annotation, itemContainerNode }) => {
              if (
                annotation instanceof
                  NutrientViewer.Annotations.HighlightAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  NutrientViewer.Annotations.CommentMarkerAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.InkAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    console.log("Text from Squiggle Annotation", text);
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              //link Annotation cannot give the text of the Rect.
              if (
                annotation instanceof NutrientViewer.Annotations.LineAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.MediaAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.NoteAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.PolygonAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  NutrientViewer.Annotations.RectangleAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  NutrientViewer.Annotations.RedactionAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.ShapeAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.SquiggleAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.StampAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  NutrientViewer.Annotations.StrikeOutAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.TextAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof
                  NutrientViewer.Annotations.UnderlineAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.UnknownAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
              if (
                annotation instanceof NutrientViewer.Annotations.WidgetAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text) => {
                    itemContainerNode.querySelector("button").textContent =
                      text;
                  });
              }
            },
          }),
        },
      };

      instance = await NutrientViewer.load({
        container,
        document: props.document,
        customUI: customUIConfiguration,
        toolbarItems: [...toolbarItemsDefault, { type: "comment" }],
        initialViewState: new NutrientViewer.ViewState({
          sidebarMode: NutrientViewer.SidebarMode.ANNOTATIONS,
        }),
      });

      instance.setViewState((viewState) =>
        viewState.set("sidebarOptions", {
          [NutrientViewer.SidebarMode.ANNOTATIONS]: {
            includeContent: [
              ...NutrientViewer.defaultAnnotationsSidebarContent,
              NutrientViewer.Comment,
            ],
          },
        }),
      ),
        console.log("Nutrient Web SDK successfully loaded!", instance);

      instance.addEventListener(
        "textSelection.change",
        async (textSelection) => {
          if (textSelection) {
            const text = await textSelection.getText();
            console.log("Selected text:", text);
            console.log("Text length:", text.length);
          } else {
            console.log("No text is selected");
          }
        },
      );

      // Cleanup event listener and unload NutrientViewer on component unmount
      return () => {
        if (instance) {
          instance.removeEventListener("textSelection.change");
          NutrientViewer.unload(container);
        }
      };
    })();
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
