import { useState, useRef } from "react";
import PdfViewerComponent from "./components/PdfViewerComponent";
import "./App.css";

function App() {
  const [document, setDocument] = useState<string>("document1.pdf");
  const [toolbar, setToolbar] = useState<string>("default");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileUrl = URL.createObjectURL(files[0]);
      setDocument(fileUrl);
      setToolbar("default");
    }
  };

  return (
    <>
      <header>
        <a
          href="https://nutrient.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "white", textDecoration: "none" }}
        >
          <h1>Redact one by one on Marked Annotation</h1>
        </a>
      </header>
      <div className="container">
        <div className="left-column">
          <label className="btnstyle" style={{ cursor: "pointer" }}>
            Click here to Upload
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
          <br />
        </div>
        <div className="right-column">
          <PdfViewerComponent document={document} toolbar={toolbar} />
        </div>
      </div>
      <footer>
        <p>© Copyright ® 2010-2024 Nutrient GmbH. All Rights Reserved</p>
        <p>Solution Engineer: Narashiman</p>
      </footer>
    </>
  );
}

export default App;
