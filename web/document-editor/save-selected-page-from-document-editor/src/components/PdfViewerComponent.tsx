import { useEffect, useRef } from "react";

interface PdfViewerComponentProps {
  document: string;
}

type NutrientViewerInstance = Awaited<
  ReturnType<typeof window.NutrientViewer.load>
>;

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

    let instance: NutrientViewerInstance;

    (async () => {
      window.NutrientViewer.unload(container); // Ensure that there's only one PSPDFKit instance.

      const defaultToolbarItems =
        window.NutrientViewer.defaultDocumentEditorToolbarItems;

      // Custom toolbar item
      const customToolbarItem = {
        type: "custom" as const,
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

          const selectedPagesIndex = selectedPages.map((e: Element) =>
            Number.parseInt(e.getAttribute("data-page-index") || "0", 10)
          );

          console.log("Selected pages indices: ", selectedPagesIndex);

          if (selectedPagesIndex.length === 0) {
            console.error("No pages selected");
            return;
          }

          // Export the selected pages
          const file = await instance.exportPDFWithOperations([
            {
              type: "keepPages",
              pageIndexes: selectedPagesIndex,
            },
          ]);

          const fileName = "selectedpages.pdf";
          const blob = new Blob([file], { type: "application/pdf" });

          // Download the file
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = objectUrl;
          a.style.display = "none";
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(objectUrl);
          document.body.removeChild(a);
        },
      };

      // Insert custom item at the desired position
      const toolbarItems = [...defaultToolbarItems, customToolbarItem];

      instance = await window.NutrientViewer.load({
        container,
        document: props.document,
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.4.0/",
        documentEditorToolbarItems: toolbarItems,
      });
    })();

    return () => {
      window.NutrientViewer?.unload(container);
    };
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
