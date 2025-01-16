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
        licenseKey:"Your License Key goes here",
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
        annotations.forEach(async (annotation: any) => {
          const { bottom, left, right, top } = annotation.boundingBox;
          const width = right - left;
          const height = bottom - top;
          console.log("Bottom: ",bottom," Left: ",left, " Right: ", right," Width: ", width," Height: ", height);
          console.log("Annotation Bounding Box: ",annotation.boundingBox);
          // Render the full page as an image URL
          instance
            .renderPageAsImageURL(
              { width: instance.pageInfoForIndex(0).width },
              0 // Assuming pageIndex is 0
            )
            .then(async (imageUrl: string) => {
              // Create a temporary image element to load the full page image
              const tempImage = new Image();
              tempImage.src = imageUrl;

              // When the temporary image is loaded, crop it using canvas
              tempImage.onload = function () {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d")!;
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(
                  tempImage,
                  left, // Crop left
                  top, // Crop top
                  width,
                  height,
                  0,
                  0,
                  width,
                  height
                );

                // Convert the cropped canvas to a data URL (JPEG)
                const croppedImageUrl = canvas.toDataURL("image/jpeg");

                // Display or save the cropped image as needed
                setAnnotationImage(croppedImageUrl);

                // Download the image as a JPEG file
                const downloadLink = document.createElement("a");
                downloadLink.href = croppedImageUrl;
                downloadLink.download = "annotation.jpg";
                downloadLink.click();
              };
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
