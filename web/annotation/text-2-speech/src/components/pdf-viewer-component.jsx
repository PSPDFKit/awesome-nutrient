import { useEffect, useRef, useState } from "react";

// PDF Viewer Component
export default function PdfViewerComponent(props) {
  // Reference to the container where PSPDFKit will be loaded
  const containerRef = useRef(null);

  // State to track whether text-to-speech is currently active
  const [_isSpeaking, setIsSpeaking] = useState(false);

  // useEffect hook to load PSPDFKit when the component mounts
  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit;
    let instance; // Declared here to ensure accessibility in cleanup

    (async () => {
      // Dynamically import PSPDFKit to support tree shaking
      PSPDFKit = await import("pspdfkit");

      // Unload any existing instance to prevent memory leaks
      PSPDFKit.unload(container);

      // Load PSPDFKit instance
      instance = await PSPDFKit.load({
        //licenseKey: import.meta.env.VITE_lkey, // Uncomment and update the .env with License key for Nutrient web sdk
        container, // The container where PSPDFKit will be rendered
        document: props.document, // The document to be displayed
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`, // Base URL for loading assets
        toolbarItems: PSPDFKit.defaultToolbarItems, // Default toolbar settings
        inlineTextSelectionToolbarItems: (
          { defaultItems: _defaultItems, hasDesktopLayout: _hasDesktopLayout },
          _selection,
        ) => {
          return [];
        }, // To remove in the inline toolbar when text is selection
      });

      // Add event listener to detect text selection changes
      instance.addEventListener(
        "textSelection.change",
        async (textSelection) => {
          if (textSelection) {
            // Stop any currently playing speech
            window.speechSynthesis.cancel();
            setIsSpeaking(false);

            // Extract selected text
            const text = await textSelection.getText();
            console.log("Selected text:", text);

            // Create a speech synthesis utterance
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true); // Set speaking state to true

            // Reset speaking state when speech ends
            utterance.onend = () => {
              setIsSpeaking(false);
            };

            // Perform a search for the selected text within the document
            const results = await instance.search(text);

            // Create highlight annotations for search results
            const annotations = results.map((result) => {
              return new PSPDFKit.Annotations.HighlightAnnotation({
                pageIndex: result.pageIndex, // Page where text was found
                rects: result.rectsOnPage, // Bounding rectangles of text
                boundingBox: PSPDFKit.Geometry.Rect.union(result.rectsOnPage), // Overall bounding box
              });
            });

            // Add the highlight annotations to the document
            instance.create(annotations);
          } else {
            console.log("No text is selected");
          }
        },
      );

      // Cleanup function: unload PSPDFKit when the component unmounts
      return () => {
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]); // Runs whenever `props.document` changes

  // Function to stop text-to-speech playback manually
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* PDF Viewer Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Floating Stop Button for Speech Synthesis */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1000,
          background: "white",
          padding: "10px",
        }}
      >
        <button type="button" onClick={handleStop}>
          Stop
        </button>
      </div>
    </div>
  );
}
