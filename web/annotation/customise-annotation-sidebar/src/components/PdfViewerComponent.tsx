import { useEffect, useRef } from "react";

interface PdfViewerComponentProps {
  document: string;
}

type NutrientViewerInstance = Awaited<ReturnType<typeof NutrientViewer.load>>;
type Annotation = InstanceType<typeof NutrientViewer.Annotations.Annotation>;
type ViewState = InstanceType<typeof NutrientViewer.ViewState>;

export default function PdfViewerComponent(props: PdfViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!NutrientViewer) {
      console.error(
        "NutrientViewer not loaded. Make sure the CDN script is included."
      );
      return;
    }

    let instance: NutrientViewerInstance | null = null;

    (async () => {
      if (container) {
        NutrientViewer.unload(container); // Ensure that there's only one PSPDFKit instance.
      }

      const toolbarItemsDefault = NutrientViewer.defaultToolbarItems;

      const customUIConfiguration = {
        [NutrientViewer.UIElement.Sidebar]: {
          [NutrientViewer.SidebarMode.ANNOTATIONS]: ({
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
                  NutrientViewer.Annotations.HighlightAnnotation &&
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
                  NutrientViewer.Annotations.CommentMarkerAnnotation &&
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
                  NutrientViewer.Annotations.InkAnnotation &&
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
                  NutrientViewer.Annotations.MarkupAnnotation &&
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
                  NutrientViewer.Annotations.LineAnnotation &&
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
                  NutrientViewer.Annotations.MarkupAnnotation &&
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
                  NutrientViewer.Annotations.MediaAnnotation &&
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
                  NutrientViewer.Annotations.NoteAnnotation &&
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
                  NutrientViewer.Annotations.MarkupAnnotation &&
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
                  NutrientViewer.Annotations.PolygonAnnotation &&
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
                  NutrientViewer.Annotations.RectangleAnnotation &&
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
                  NutrientViewer.Annotations.RedactionAnnotation &&
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
                  NutrientViewer.Annotations.ShapeAnnotation &&
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
                  NutrientViewer.Annotations.SquiggleAnnotation &&
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
                  NutrientViewer.Annotations.StampAnnotation &&
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
                  NutrientViewer.Annotations.StrikeOutAnnotation &&
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
                  NutrientViewer.Annotations.TextAnnotation &&
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
                  NutrientViewer.Annotations.UnderlineAnnotation &&
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
                  NutrientViewer.Annotations.UnknownAnnotation &&
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
                  NutrientViewer.Annotations.WidgetAnnotation &&
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

      instance = await NutrientViewer.load({
        container,
        document: props.document,
        customUI: customUIConfiguration,
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.7.0/",
        toolbarItems: [...toolbarItemsDefault, { type: "comment" }],
        initialViewState: new NutrientViewer.ViewState({
          sidebarMode: NutrientViewer.SidebarMode.ANNOTATIONS,
        }),
      });

      instance.setViewState((viewState: ViewState) =>
        viewState.set("sidebarOptions", {
          [NutrientViewer.SidebarMode.ANNOTATIONS]: {
            includeContent: [
              ...NutrientViewer.defaultAnnotationsSidebarContent,
              NutrientViewer.Comment,
            ],
          },
        })
      ),
        console.log("Nutrient Web SDK successfully loaded!", instance);

      instance.addEventListener(
        "textSelection.change",
        async (
          textSelection: InstanceType<
            typeof NutrientViewer.TextSelection
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
          NutrientViewer.unload(container);
        }
      };
    })();
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
