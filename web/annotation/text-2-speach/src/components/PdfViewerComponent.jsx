import { useEffect, useRef, useState } from "react";

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  let PSPDFKit, instance;

  const [textToRead, setTextToRead] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      PSPDFKit = await import("pspdfkit");

      PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

      const defaultToolbarItems = PSPDFKit.defaultDocumentEditorToolbarItems;

      // Insert custom item at the desired position
      const toolbarItems = [...defaultToolbarItems];

      instance = await PSPDFKit.load({
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${import.meta.env.PUBLIC_URL ?? ""}`,
        documentEditorToolbarItems: toolbarItems,
      });

      // Add event listener for text selection change
      instance.addEventListener("textSelection.change", async textSelection => {
        if (textSelection) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          const text = await textSelection.getText();
          console.log("Selected text:", text);
          //setTextToRead(text);
          
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        
            utterance.onend = () => {
              setIsSpeaking(false);
            };
          const results = await instance.search(text);
          const annotations = results.map((result) => {
            return new PSPDFKit.Annotations.HighlightAnnotation({
              pageIndex: result.pageIndex,
              rects: result.rectsOnPage,
              boundingBox: PSPDFKit.Geometry.Rect.union(result.rectsOnPage),
            });
          });
          //instance.create(annotations);
        } else {
          console.log("No text is selected");
        }
      });

      // Cleanup event listener on component unmount
      return () => {
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]);

  
  const handlePause = () => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
    }
  };

  const handleResume = () => {
    if (isSpeaking) {
      window.speechSynthesis.resume();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1000, background: "white", padding: "10px" }}>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleResume}>Resume</button>
        <button onClick={handleStop}>Stop</button>
      </div>
    </div>
  );
}
