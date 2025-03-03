import { useState } from "react";

import NutrientPdfViewer from "./components/nutrientpdfviewer";
import "./app.css";

function App() {
  const [document, setDocument] = useState("download.pdf");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const objectUrl = URL.createObjectURL(file);

    setDocument(objectUrl);
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
        <NutrientPdfViewer document={document} />
      </div>
    </div>
  );
}

export default App;
