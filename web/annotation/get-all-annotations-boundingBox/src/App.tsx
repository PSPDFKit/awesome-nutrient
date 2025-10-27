import { useState } from "react";
import PdfViewerComponent from "./components/PdfViewerComponent.tsx";
import "./App.css";

function App() {
  const [document, setDocument] = useState<string>("document_1.pdf");
  const [handleAnnotation, setHandleAnnotation] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setDocument(objectUrl);
    }
  };

  const handleAnnotationCoordinates = () => {
    setHandleAnnotation("get");
    reset();
  };

  const reset = () => {
    setTimeout(() => {
      setHandleAnnotation("");
    }, 1000);
  };

  return (
    <div className="App">
      <label htmlFor="file-input" className="App-input">
        Open another document
      </label>
      <input
        id="file-input"
        type="file"
        onChange={handleFileChange}
        className="chooseFile"
        accept="application/pdf"
        name="pdf"
      />
      <button onClick={handleAnnotationCoordinates} className="btnstyle">
        Refresh / Reset Annotations
      </button>
      <br />

      <div className="App-viewer">
        <PdfViewerComponent
          document={document}
          handleAnnotation={handleAnnotation}
        />
      </div>
    </div>
  );
}

export default App;

