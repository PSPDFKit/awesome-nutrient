import { useEffect, useRef, useState } from "react";
import type { Instance, Annotation } from "@nutrient-sdk/viewer";

interface PdfViewerProps {
  document: string;
  handleAnnotation: string;
}

let instance: Instance;

export default function PdfViewerComponent(props: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotationImage, setAnnotationImage] = useState<string>("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    (async function loadPdf() {
      const NutrientViewer = window.NutrientViewer;
      if (!NutrientViewer) {
        console.error(
          "NutrientViewer not loaded. Make sure the CDN script is included."
        );
        return;
      }

      NutrientViewer.unload(container);

      const toolbarItemsDefault = [...NutrientViewer.defaultToolbarItems];
      instance = await NutrientViewer.load({
        container,
        document: props.document,
        toolbarItems: toolbarItemsDefault,
      });
    })();
    return () => {
      window.NutrientViewer?.unload(container);
    };
  }, [props.document]);

  useEffect(() => {
    if (props.handleAnnotation === "get") {
      const fetchAnnotationCoordinates = async () => {
        const annotations = await instance.getAnnotations(0); // Assuming pageIndex is 0
        annotations.forEach((annotation: Annotation) => {
          console.log(annotation.boundingBox);
          const { left, right } = annotation.boundingBox;
          // Rendering the bounding box area as an image
          instance
            .renderPageAsImageURL(
              { width: right - left },
              0 // Assuming pageIndex is 0
            )
            .then((imageUrl: string) => {
              // Display or save the image as needed
              setAnnotationImage(imageUrl);

              // Download the image as a JPEG file
              const downloadLink = document.createElement("a");
              downloadLink.href = imageUrl;
              downloadLink.download = "annotation.jpg";
              downloadLink.click();
            });
        });
      };
      fetchAnnotationCoordinates();
    }
  }, [props.handleAnnotation]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
      {annotationImage && (
        <img
          src={annotationImage}
          alt="Annotation"
          style={{ display: "none" }}
        />
      )}
    </>
  );
}
