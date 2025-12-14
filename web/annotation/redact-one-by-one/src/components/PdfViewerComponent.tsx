import { useEffect, useRef } from "react";
import "../App.css";

interface PdfViewerProps {
  document: string;
  toolbar: string;
}


let NutrientViewer: any;
let instance: any;

export default function PdfViewerComponent(props: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    const initializeSDK = async () => {
      try {
        NutrientViewer = window.NutrientViewer;
        
        try {
          NutrientViewer.unload(container);
        } catch (e) {
          // Ignore if nothing to unload
        }

        const toolbarItemsDefault = NutrientViewer.defaultToolbarItems;
        
        const redactionAnnotationsHandlerCallback = (annotation: any) => {
          return annotation instanceof NutrientViewer.Annotations.RedactionAnnotation
            ? [
                {
                  type: "custom",
                  title: "Accept",
                  id: "tooltip-accept-annotation",
                  className: "TooltipItem-Duplication",
                  onPress: async () => {
                    const allRedactionAnnotations = (
                      await getAllAnnotations()
                    ).filter((a: any) => a.id !== annotation.id);
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

        const getAllAnnotations = async () => {
          let annotationsList = NutrientViewer.Immutable.List();
          for (let i = 0; i < instance.totalPageCount - 1; i++) {
            const anns = (await instance.getAnnotations(i)).filter(
              (a: any) => a instanceof NutrientViewer.Annotations.RedactionAnnotation
            );
            annotationsList = annotationsList.concat(anns);
          }
          return annotationsList;
        };

        instance = await NutrientViewer.load({
          container,
          document: props.document,
          toolbarItems: toolbarItemsDefault,
          theme: NutrientViewer.Theme.DARK,
          annotationTooltipCallback: redactionAnnotationsHandlerCallback,
          toolbarPlacement: NutrientViewer.ToolbarPlacement.TOP,
        });
        
        console.log("Instance:", instance);
        createRedactions();
      } catch (error) {
        console.error("Error initializing NutrientViewer:", error);
      }
    };

    initializeSDK();

    const createRedactions = async () => {
      const terms = ["summarize", "trees", "Learning", "Forests"];

      for (const term of terms) {
        if (term.length === 0) continue;

        if (instance) {
          const options = {
            searchType: NutrientViewer.SearchType.TEXT,
            searchInAnnotations: true,
          };

          try {
            const ids = await instance.createRedactionsBySearch(term, options);
            console.log("Redactions added for term:", term, ids);
          } catch (error) {
            console.error("Error creating redactions for term:", term, error);
          }
        }
      }
    };

    return () => {
      if (NutrientViewer && container) {
        try {
          NutrientViewer.unload(container);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
