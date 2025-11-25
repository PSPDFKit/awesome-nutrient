import { useEffect, useRef } from "react";
import type { Instance, Annotation } from "@nutrient-sdk/viewer";

interface PdfViewerComponentProps {
  document: string;
}
type ViewState = InstanceType<typeof window.NutrientViewer.ViewState>;

// Type guard to check if annotation has rects property
function hasRects(
  annotation: Annotation
): annotation is Annotation & { rects: any } {
  return "rects" in annotation && annotation.rects !== undefined;
}

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

    let instance: Instance | null = null;

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
            containerNode: Node;
          }) => ({
            node: containerNode as HTMLElement,
            onRenderItem: ({
              item: annotation,
              itemContainerNode,
            }: {
              item: Annotation;
              itemContainerNode: Node;
            }) => {
              const containerElement = itemContainerNode as HTMLElement;
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.HighlightAnnotation &&
                instance
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.CommentMarkerAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.InkAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              //link Annotation cannot give the text of the Rect.
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.LineAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.MediaAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.NoteAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.PolygonAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.RectangleAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.ShapeAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.StampAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.TextAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.UnknownAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
                    if (button) {
                      button.textContent = text;
                    }
                  });
              }
              if (
                annotation instanceof
                  window.NutrientViewer.Annotations.WidgetAnnotation &&
                instance &&
                hasRects(annotation)
              ) {
                instance
                  .getTextFromRects(annotation.pageIndex, annotation.rects)
                  .then((text: string) => {
                    const button = containerElement.querySelector("button");
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

      const textSelectionHandler = async (
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
      };

      instance.addEventListener("textSelection.change", textSelectionHandler);

      // Cleanup event listener and unload PSPDFKit on component unmount
      return () => {
        if (instance) {
          instance.removeEventListener(
            "textSelection.change",
            textSelectionHandler
          );
          window.NutrientViewer.unload(container);
        }
      };
    })();
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
