import { useId, useState } from "react";

import NutrientPdfViewer from "./components/nutrient-pdf-viewer";
import "./app.css";

function App() {
  const [document, setDocument] = useState("download.pdf");
  const fileInputId = useId(); // unique ID for the input

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setDocument(objectUrl);
  };

  return (
    <div className="App">
      <label htmlFor={fileInputId} className="App-input">
        Open another document
      </label>
      <input
        id={fileInputId}
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
