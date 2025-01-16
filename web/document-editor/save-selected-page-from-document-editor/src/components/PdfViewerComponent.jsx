import { useEffect, useRef } from "react";

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit, instance;

    (async function () {
      PSPDFKit = await import("pspdfkit");

      PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

      const defaultToolbarItems = PSPDFKit.defaultDocumentEditorToolbarItems;

      // Custom toolbar item
      const customToolbarItem = {
        type: "custom",
        id: "custom-save-as",
        title: "My Save as",
        onPress: async () => {
          console.log("started");
          
          // Select pages marked as selected
          const selectedPages = Array.from(
            instance.contentDocument.querySelectorAll(
              ".PSPDFKit-DocumentEditor-Thumbnails-Page-Selected"
            )
          );

          const selectedPagesIndex = selectedPages.map((e) =>
            parseInt(e.getAttribute("data-page-index"), 10)
          );
          
          console.log("Selected pages indices: ", selectedPagesIndex);

          if (selectedPagesIndex.length === 0) {
            console.error("No pages selected");
            return;
          }

          // Export the selected pages
          const file = await instance.exportPDFWithOperations([
            {
              type: 'keepPages',
              pageIndexes: selectedPagesIndex,
            },
          ]);

          const fileName = "selectedpages.pdf";
          const blob = new Blob([file], { type: 'application/pdf' });

          // Download the file
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
          } else {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.style = "display: none";
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(objectUrl);
            document.body.removeChild(a);
          }
        },
      };

      // Insert custom item at the desired position
      const toolbarItems = [...defaultToolbarItems, customToolbarItem];

      instance = await PSPDFKit.load({
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`,
        documentEditorToolbarItems: toolbarItems,
      });
    })();

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
