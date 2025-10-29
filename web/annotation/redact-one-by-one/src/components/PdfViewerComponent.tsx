import { useEffect, useRef } from "react";
import "../App.css";

interface PdfViewerProps {
  document: string;
  toolbar: string;
}

type NutrientViewerInstance = Awaited<ReturnType<typeof NutrientViewer.load>>;
type Annotation = InstanceType<typeof NutrientViewer.Annotations.Annotation>;

let instance: NutrientViewerInstance;

export default function PdfViewerComponent(props: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initializeNutrientViewer = async () => {
      if (!NutrientViewer) {
        console.error(
          "NutrientViewer not loaded. Make sure the CDN script is included."
        );
        return;
      }

      try {
        NutrientViewer.unload(container);

        const toolbarItemsDefault = NutrientViewer.defaultToolbarItems;
        const redactionAnnotationsHandlerCallback = (
          annotation: Annotation
        ) => {
          return annotation instanceof
            NutrientViewer.Annotations.RedactionAnnotation
            ? [
                {
                  type: "custom",
                  title: "Accept",
                  id: "tooltip-accept-annotation",
                  className: "TooltipItem-Duplication",
                  onPress: async () => {
                    const allRedactionAnnotations = (
                      await getAllAnnotations()
                    ).filter((a: Annotation) => a.id !== annotation.id);
                    await instance.delete(allRedactionAnnotations);
                    await instance.applyRedactions();
                    await instance.create(allRedactionAnnotations);
                  },
                },
                {
                  type: "custom",
                  title: "Reject",
                  id: "tooltip-reject-annotation",
                  className: "TooltipItem-Duplication",
                  onPress: async () => {
                    instance.delete(annotation);
                  },
                },
              ]
            : [];
        };

        const getAllAnnotations = async (): Promise<
          typeof NutrientViewer.Immutable.List
        > => {
          let annotationsList = NutrientViewer.Immutable.List();
          for (let i = 0; i < instance.totalPageCount - 1; i++) {
            const anns = (await instance.getAnnotations(i)).filter(
              (a: Annotation) =>
                a instanceof NutrientViewer.Annotations.RedactionAnnotation
            );
            annotationsList = annotationsList.concat(anns);
          }
          return annotationsList;
        };
        instance = await NutrientViewer.load({
          container,
          document: props.document,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          toolbarItems: toolbarItemsDefault,
          theme: NutrientViewer.Theme.DARK,
          annotationTooltipCallback: redactionAnnotationsHandlerCallback,
          styleSheets: ["/mypspdfkit.css"],
          toolbarPlacement: NutrientViewer.ToolbarPlacement.TOP,
        });
        console.log("Instance:", instance);
        // Create redactions once NutrientViewer is loaded
        createRedactions();
      } catch (error) {
        console.error("Error initializing NutrientViewer:", error);
      }
    };

    initializeNutrientViewer();
    const createRedactions = async (): Promise<void> => {
      const NutrientViewer = window.NutrientViewer;
      if (!NutrientViewer) return;

      const terms = ["summarize", "trees", "Learning", "Forests"];

      for (const term of terms) {
        console.log("Search term:", term);

        if (term.length === 0) {
          console.error("Search term is empty.");
          continue;
        }

        if (instance) {
          const options = {
            searchType: NutrientViewer.SearchType.TEXT,
            searchInAnnotations: true,
          };
          console.log("Options:", options);

          try {
            const ids = await instance.createRedactionsBySearch(term, options);
            console.log(
              "The following annotations have been added for term:",
              term,
              ids
            );
            // Apply redactions if needed
            // await instance.applyRedactions();
          } catch (error) {
            console.error("Error creating redactions for term:", term, error);
          }
        }
      }

      console.log("All redactions have been created.");
    };

    return () => {
      NutrientViewer?.unload(container);
    };
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
