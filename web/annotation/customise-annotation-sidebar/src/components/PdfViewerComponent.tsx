import { useEffect, useRef } from "react";

interface PdfViewerComponentProps {
  document: string;
}

type NutrientViewerInstance = Awaited<
  ReturnType<typeof window.NutrientViewer.load>
>;
type Annotation = InstanceType<
  typeof window.NutrientViewer.Annotations.Annotation
>;
type ViewState = InstanceType<typeof window.NutrientViewer.ViewState>;

export default function PdfViewerComponent(props: PdfViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!window.NutrientViewer) {
      console.error(
        "NutrientViewer not loaded. Make sure the CDN script is included."
      );
      return;
    }

    let instance: NutrientViewerInstance | null = null;

    (async () => {
      if (container) {
        window.NutrientViewer.unload(container); // Ensure that there's only one PSPDFKit instance.
      }

      const toolbarItemsDefault = window.NutrientViewer.defaultToolbarItems;

      const customUIConfiguration = {
        [window.NutrientViewer.UIElement.Sidebar]: {
          [window.NutrientViewer.SidebarMode.ANNOTATIONS]: ({
            containerNode,
          }: {
            containerNode: HTMLElement;
          }) => ({
            node: containerNode,
            onRenderItem: ({
              item: annotation,
              itemContainerNode,
            }: {
              item: Annotation;
              itemContainerNode: HTMLElement;
            }) => {
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.HighlightAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.CommentMarkerAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.InkAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    console.log("Text from Squiggle Annotation", text);
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              //link Annotation cannot give the text of the Rect.
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.LineAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.MediaAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.NoteAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.MarkupAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.PolygonAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.RectangleAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.RedactionAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.ShapeAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.SquiggleAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.StampAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.StrikeOutAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.TextAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.UnderlineAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.UnknownAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.WidgetAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = itemContainerNode.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
            },
          }),
        },
      };

      instance = await window.NutrientViewer.load({
        container,
        document: props.document,
        customUI: customUIConfiguration,
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.7.0/",
        toolbarItems: [...toolbarItemsDefault, { type: "comment" }],
        initialViewState: new window.NutrientViewer.ViewState({
          sidebarMode: window.NutrientViewer.SidebarMode.ANNOTATIONS,
        }),
      });

      instance.setViewState((viewState: ViewState) =>
        viewState.set("sidebarOptions", {
          [window.NutrientViewer.SidebarMode.ANNOTATIONS]: {
            includeContent: [
              ...window.NutrientViewer.defaultAnnotationsSidebarContent,
              window.NutrientViewer.Comment,
            ],
          },
        })
      ),
        console.log("Nutrient Web SDK successfully loaded!", instance);

      instance.addEventListener(
        "textSelection.change",
        async (
          textSelection: InstanceType<
            typeof window.NutrientViewer.TextSelection
          > | null
        ) => {
          if (textSelection) {
            const text = await textSelection.getText();
            console.log("Selected text:", text);
            console.log("Text length:", text.length);
          } else {
            console.log("No text is selected");
          }
        }
      );

      // Cleanup event listener and unload PSPDFKit on component unmount
      return () => {
        if (instance) {
          instance.removeEventListener("textSelection.change");
          window.NutrientViewer.unload(container);
        }
      };
    })();
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
