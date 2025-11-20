import { useState } from "react";

import PdfViewerComponent from "./components/pdf-viewer-component.tsx";
import "./app.css";

function App() {
  const [document, setDocument] = useState<string>("BlankA4PDF.pdf");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setDocument(objectUrl);
    }
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
      <div className="App-viewer">
        <PdfViewerComponent document={document} />
      </div>
    </div>
  );
}

export default App;

