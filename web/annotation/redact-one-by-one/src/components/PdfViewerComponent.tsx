import React, { useEffect, useRef, useState } from "react";
import "pspdfkit";
import "../App.css";

interface PdfViewerProps {
  document: string;
  toolbar: string;
}

let PSPDFKit: any;
let instance: any;
let totalPageCount_;

export default function PdfViewerComponent(props: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    const initializePSPDFKit = async () => {
      try {
        PSPDFKit = await import("pspdfkit");
        if (PSPDFKit) {
          PSPDFKit.unload(container);
        }

        const toolbarItemsDefault = PSPDFKit.defaultToolbarItems;
        const redactionAnnotationsHandlerCallback = (annotation) => {
          return annotation instanceof PSPDFKit.Annotations.RedactionAnnotation
            ? [
                {
                  type: 'custom',
                  title: 'Accept',
                  id: 'tooltip-accept-annotation',
                  className: 'TooltipItem-Duplication',
                  onPress: async () => {
                    const allRedactionAnnotations = (
                      await getAllAnnotations()
                    ).filter((a) => a.id !== annotation.id);
                    await instance.delete(allRedactionAnnotations);
                    await instance.applyRedactions();
                    await instance.create(allRedactionAnnotations);
                  },
                },
                {
                  type: 'custom',
                  title: 'Reject',
                  id: 'tooltip-reject-annotation',
                  className: 'TooltipItem-Duplication',
                  onPress: async () => {
                    instance.delete(annotation);
                  },
                },  
              ]
            : [];
        };
      
        const getAllAnnotations = async () => {
          let annotationsList = PSPDFKit.Immutable.List();
          for (let i = 0; i < instance.totalPageCount - 1; i++) {
            const anns = (await instance.getAnnotations(i)).filter(
              (a) => a instanceof PSPDFKit.Annotations.RedactionAnnotation
            );
            annotationsList = annotationsList.concat(anns);
          }
          return annotationsList;
        };
        instance = await PSPDFKit.load({
          container,
          document: props.document,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          toolbarItems: toolbarItemsDefault,
          theme: PSPDFKit.Theme.DARK,
          annotationTooltipCallback: redactionAnnotationsHandlerCallback,
          styleSheets: ["/mypspdfkit.css"],
          toolbarPlacement: PSPDFKit.ToolbarPlacement.TOP,
        });
        console.log("Instance:",instance);
        // Create redactions once PSPDFKit is loaded
        createRedactions();
      } catch (error) {
        console.error("Error initializing PSPDFKit:", error);
      }
    };

    initializePSPDFKit();
    const createRedactions = async () => {
      const terms = ["summarize", "trees", "Learning", "Forests"];
  
      for (const term of terms) {
        console.log("Search term:", term);
  
        if (term.length === 0) {
          console.error("Search term is empty.");
          continue;
        }
  
        if (instance) {
          const options = {
            searchType: PSPDFKit.SearchType.TEXT,
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

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}