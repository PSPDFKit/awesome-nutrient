import { useEffect, useRef } from "react";

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  let PSPDFKit, instance;
  let isProcessingPaste = false;

  // Handle clipboard paste - moved outside useEffect to make it accessible
  const handlePaste = async (event, instance) => {
    if (isProcessingPaste) return;
    isProcessingPaste = true;

    try {
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
      const item = items[0]; // this will get only the last copied data from clipboard

      const content_Type = item.type;
      const currentPage = instance.viewState.currentPageIndex;

      if (item.kind === "file" && item.type.startsWith("image")) {
        const file = item.getAsFile();
        const imageAttachmentId = await instance.createAttachment(file);
        const annotation = new PSPDFKit.Annotations.ImageAnnotation({
          pageIndex: currentPage,
          contentType: content_Type,
          imageAttachmentId,
          description: "Pasted Image Annotation",
          boundingBox: new PSPDFKit.Geometry.Rect({
            left: 10,
            top: 50,
            width: 150,
            height: 150,
          }),
        });
        await instance.create(annotation);
      } else if (item.kind === "string") {
        item.getAsString(async (pastedText) => {
          // Here you can create a text annotation if needed
          const textAnnotation = new PSPDFKit.Annotations.TextAnnotation({
            pageIndex: currentPage,
            text: {
              format: "plain",
              value: pastedText,
            },
            boundingBox: new PSPDFKit.Geometry.Rect({
              left: 10,
              top: 50,
              width: 600,
              height: 250,
            }),
          });
          await instance.create(textAnnotation);
        });
      } else {
        console.log("Unsupported clipboard item");
      }
    } finally {
      isProcessingPaste = false;
    }
  };

  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      PSPDFKit = await import("pspdfkit");

      PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

      const defaultToolbarItems = PSPDFKit.defaultDocumentEditorToolbarItems;

      // Insert custom item at the desired position
      const toolbarItems = [...defaultToolbarItems];

      instance = await PSPDFKit.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`,
        documentEditorToolbarItems: toolbarItems,
      });

      // Add event listener for paste
      const handlePasteEvent = (event) => handlePaste(event, instance);
      document.addEventListener("paste", handlePasteEvent);

      // Cleanup on component unmount
      return () => {
        document.removeEventListener("paste", handlePasteEvent);
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]);

  // Function to handle speech-to-text and create annotation
  const handleSpeechToText = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      // Copy text to clipboard
      navigator.clipboard.writeText(transcript).then(() => {
        console.log("Text copied to clipboard");

        // Directly call handlePaste with simulated event data
        simulatePasteEvent(transcript);
      });
    };

    recognition.start();
  };

  // Function to simulate paste event
  const simulatePasteEvent = (text) => {
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });

    // Manually set the clipboard data with the text
    pasteEvent.clipboardData.setData("text/plain", text);

    // Call handlePaste directly with instance
    handlePaste(pasteEvent, instance);
  };

  return (
    <div>
      <button onClick={handleSpeechToText}>Start Speech to Text</button>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}
