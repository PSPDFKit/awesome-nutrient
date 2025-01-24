// Import necessary React hooks
import { useEffect, useRef } from "react";

// Global variables for tracking annotation positions
var linecount = 0;
let add = 0;
let currentPage, pageHeight, pageWidth;

// Define the main PDF viewer component
export default function PdfViewerComponent(props) {
  // Create references for the PDF container and PSPDFKit instance
  const containerRef = useRef(null);
  const instanceRef = useRef(null); // Store PSPDFKit instance
  const PSPDFKitRef = useRef(null); // Store PSPDFKit module

  // Function to enhance text with first letter to uppercase
  const correctText = (text) => {
    return text
      .replace(
        /(\.\s+|^)([a-z])/g,
        (match, prefix, letter) => prefix + letter.toUpperCase()
      ) // Capitalize first letter
      .replace(/\bi\b/g, "I") // Capitalize 'I'
      .trim();
  };

  // useEffect hook to load PSPDFKit and set up event listeners
  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      const PSPDFKit = await import("pspdfkit");
      PSPDFKitRef.current = PSPDFKit; // Store PSPDFKit module globally
      PSPDFKit.unload(container); // Ensure only one instance exists

      // Load PSPDFKit instance
      const instance = await PSPDFKit.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`,
        toolbarItems: PSPDFKit.defaultToolbarItems,
      });

      instanceRef.current = instance; // Store instance in ref

      // Store current page details
      currentPage = instance.viewState.currentPageIndex;
      const pageInfo = instance.pageInfoForIndex(currentPage);
      pageWidth = pageInfo.width;
      pageHeight = pageInfo.height;

      // Cleanup on component unmount
      return () => {
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]);

  // Function to handle speech-to-text and create annotation with text enhancements
  const handleSpeechToText = async () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = correctText(transcript); // Apply text corrections

      if (!instanceRef.current || !PSPDFKitRef.current) {
        console.error("PSPDFKit instance is not available.");
        return;
      }

      const PSPDFKit = PSPDFKitRef.current; // Access PSPDFKit module

      // To track annotation position place them correctly 
      linecount += 1;
      add = linecount > 1 ? add + 25 : 0;

      const bbox = new PSPDFKit.Geometry.Rect({
        left: 10,
        top: 50 + add,
        width: pageWidth - 20,
        height: 25,
      });

      const textAnnotation = new PSPDFKit.Annotations.TextAnnotation({
        pageIndex: currentPage,
        text: {
          format: "plain",
          value: transcript,
        },
        isFitting: true,
        fontSize: 10,
        font: "Verdana",
        boundingBox: bbox,
      });

      try {
        await instanceRef.current.create(textAnnotation);
      } catch (error) {
        console.error("Error creating annotation:", error);
      }
    };

    recognition.start();
  };

  return (
    <div>
      {/* Button to start speech-to-text */}
      <button onClick={handleSpeechToText}>Start Speech to Text</button>
      {/* PDF Viewer Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}
