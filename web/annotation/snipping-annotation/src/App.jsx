import React, { useState, useRef } from "react";
import PdfViewerComponent from "./components/PdfViewerComponent";
import "./App.css";

function App() {
  const [document, setDocument] = useState("document1.pdf");
  const [handleAnnotation, setHandleAnnotation] = useState("");
  const fileInputRef = useRef(null);

  const handleAnnotationCoordinates = () => {
    setHandleAnnotation("get");
    reset();
  };

  const reset = () => {
    setTimeout(() => {
      setHandleAnnotation("");
    }, 1000);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileUrl = URL.createObjectURL(files[0]);
      setDocument(fileUrl);
    }
  };

  return (
    <>
      <div className="background" />
      <h1 className="first-heading">
        Snipping Annotation Example
      </h1>
      <div className="container">
        <section className="stats">
          <section className="stat">
            <label className="btnstyleUpload" style={{ cursor: "pointer", display: "block", marginBottom: "1rem" }}>
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
            <button
              onClick={handleAnnotationCoordinates}
              className="btnstyle"
            >
              Save Annotation as Image
            </button>
          </section>
        </section>
        <div className="textarea">
          <PdfViewerComponent
            document={document}
            handleAnnotation={handleAnnotation}
          />
        </div>
      </div>
      <footer className="footer">
        <small className="copyright">
          © Copyright ® 2010-2024 Nutrient GmbH. All Rights Reserved
        </small>
      </footer>
    </>
  );
}

export default App;
