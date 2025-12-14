// Import necessary React hooks
import { useEffect, useRef } from "react";


// Global variables for tracking annotation positions
let linecount = 0;
let add = 0;
let currentPage;
let pageHeight;
let pageWidth;

// Define the main PDF viewer component
export default function PdfViewerComponent(props) {
  // Create references for the PDF container and NutrientViewer instance
  const containerRef = useRef(null);
  const instanceRef = useRef(null); // Store NutrientViewer instance
  const NutrientViewerRef = useRef(null); // Store NutrientViewer module

  // Function to enhance text with first letter to uppercase
  const correctText = (text) => {
    return text
      .replace(
        /(\.\s+|^)([a-z])/g,
        (match, prefix, letter) => prefix + letter.toUpperCase(),
      ) // Capitalize first letter
      .replace(/\bi\b/g, "I") // Capitalize 'I'
      .trim();
  };

  // useEffect hook to load NutrientViewer and set up event listeners
  useEffect(() => {
    const container = containerRef.current;

    (async () => {
      const NutrientViewer = window.NutrientViewer;
      NutrientViewerRef.current = NutrientViewer; // Store NutrientViewer module globally

      // Load NutrientViewer instance
      const instance = await NutrientViewer.load({
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`,
        toolbarItems: NutrientViewer.defaultToolbarItems,
      });

      instanceRef.current = instance; // Store instance in ref

      // Store current page details
      currentPage = instance.viewState.currentPageIndex;
      const pageInfo = instance.pageInfoForIndex(currentPage);
      pageWidth = pageInfo.width;
      pageHeight = pageInfo.height;

      // Cleanup on component unmount
      return () => {
      };
    })();
  }, [props.document]);

  // Function to handle speech-to-text and create annotation with text enhancements
  const handleSpeechToText = async () => {
    const recognition = new (
      window.SpeechRecognition || window.webkitSpeechRecognition
    )();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = correctText(transcript); // Apply text corrections

      if (!instanceRef.current || !NutrientViewerRef.current) {
        console.error("NutrientViewer instance is not available.");
        return;
      }

      const NutrientViewer = NutrientViewerRef.current; // Access NutrientViewer module

      // To track annotation position place them correctly
      linecount += 1;
      add = linecount > 1 ? add + 25 : 0;

      const bbox = new NutrientViewer.Geometry.Rect({
        left: 10,
        top: 50 + add,
        width: pageWidth - 20,
        height: 25,
      });

      const textAnnotation = new NutrientViewer.Annotations.TextAnnotation({
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
      <button type="button" onClick={handleSpeechToText}>
        Start Speech to Text
      </button>
      {/* PDF Viewer Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}
