// App.jsx
import { useId, useState } from "react";

import PdfViewerComponent from "./components/PdfViewerComponent.jsx";
import "./App.css";

function App() {
  const [document, setDocument] = useState("document.pdf");
  const fileInputId = useId(); // generate unique ID

  const handleFileChange = (event) => {
    const file = event.target.files[0];
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
        <PdfViewerComponent document={document} />
      </div>
    </div>
  );
}

export default App;
