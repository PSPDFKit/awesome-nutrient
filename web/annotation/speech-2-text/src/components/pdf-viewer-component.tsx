// Import necessary React hooks
import { useEffect, useRef } from "react";

type NutrientViewerInstance = Awaited<ReturnType<typeof NutrientViewer.load>>;

interface PdfViewerComponentProps {
  document: string;
}

// Global variables for tracking annotation positions
let linecount = 0;
let add = 0;
let currentPage: number;
let pageWidth: number;

// Define the main PDF viewer component
export default function PdfViewerComponent(props: PdfViewerComponentProps) {
  // Create references for the PDF container and PSPDFKit instance
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<NutrientViewerInstance | null>(null); // Store PSPDFKit instance

  // Function to enhance text with first letter to uppercase
  const correctText = (text: string): string => {
    return text
      .replace(
        /(\.\s+|^)([a-z])/g,
        (_match, prefix, letter) => prefix + letter.toUpperCase()
      ) // Capitalize first letter
      .replace(/\bi\b/g, "I") // Capitalize 'I'
      .trim();
  };

  // useEffect hook to load PSPDFKit and set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!NutrientViewer) {
      console.error(
        "NutrientViewer not loaded. Make sure the CDN script is included."
      );
      return;
    }

    (async () => {
      NutrientViewer.unload(container); // Ensure only one instance exists

      // Load PSPDFKit instance
      const instance = await NutrientViewer.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: props.document,
        baseUrl: "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.5.2/",
        toolbarItems: NutrientViewer.defaultToolbarItems,
      });

      instanceRef.current = instance; // Store instance in ref

      // Store current page details
      currentPage = instance.viewState.currentPageIndex;
      const pageInfo = instance.pageInfoForIndex(currentPage);
      pageWidth = pageInfo.width;

      // Cleanup on component unmount
      return () => {
        NutrientViewer.unload(container);
      };
    })();
  }, [props.document]);

  // Function to handle speech-to-text and create annotation with text enhancements
  const handleSpeechToText = async () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = correctText(transcript); // Apply text corrections

      if (!instanceRef.current) {
        console.error("PSPDFKit instance is not available.");
        return;
      }

      const NutrientViewer = window.NutrientViewer; // Access PSPDFKit module

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
