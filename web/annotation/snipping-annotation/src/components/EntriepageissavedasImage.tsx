import React, { useEffect, useRef, useState } from "react";
import "pspdfkit";
import html2canvas from "html2canvas";

interface PdfViewerProps {
  document: string;
  handleAnnotation: string;
}

let instance: any;
let PSPDFKit: any;

export default function PdfViewerComponent(props: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotationImage, setAnnotationImage] = useState<string>("");

  useEffect(() => {
    const container = containerRef.current;

    (async function loadPdf() {
      PSPDFKit = await import("pspdfkit");

      if (PSPDFKit) {
        PSPDFKit.unload(container);
      }

      const toolbarItemsDefault = PSPDFKit.defaultToolbarItems;
      instance = await PSPDFKit.load({
        licenseKey:"Your License key goes here",
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
        toolbarItems: toolbarItemsDefault,
      });
    })();
    return () => PSPDFKit && PSPDFKit.unload(container);
  }, [props.document]);

  useEffect(() => {
    if (props.handleAnnotation === "get") {
      const fetchAnnotationCoordinates = async () => {
        const annotations = await instance.getAnnotations(0); // Assuming pageIndex is 0
        annotations.forEach((annotation: any) => {
          console.log(annotation.boundingBox);
          const { bottom, height, left, right, top, width } =
            annotation.boundingBox;
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
