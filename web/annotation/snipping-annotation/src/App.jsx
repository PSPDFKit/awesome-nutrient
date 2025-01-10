import React, { useState } from "react";
import PdfViewerComponent from "./components/PdfViewerComponent";
import {
  ThemeProvider,
  I18nProvider,
  Link,
  Avatar,
  FileUpload,
  ActionButton,
} from "@baseline-ui/core";
import "./App.css";

function App() {
  const [document, setDocument] = useState("document1.pdf");
  const [handleAnnotation, setHandleAnnotation] = useState("");
  const handleAnnotationCoordinates = () => {
    setHandleAnnotation("get");
    reset();
  };

  const reset = () => {
    setTimeout(function() {
    setHandleAnnotation("");
    }, 1000);
  }
  const handleFileSelected = (files) => {
    if (files && files.length > 0) {
      const fileUrl = URL.createObjectURL(files[0]);
      setDocument(fileUrl);
    }
  };

  return (
    <ThemeProvider>
      <I18nProvider locale="en-US">
        <div className="background"></div>
        <h1 className="first-heading">
          Learning
          <span className="first-heading--special">Baseline-UI</span>
        </h1>
        <Link
          href="https://pspdfkit.com"
          target="_blank"
          size="lg"
          style={{ alignItems: "center", width: "50px" }}
        >
          <Avatar
            name="Narashiman"
            size="md"
            hasNotifications
            style={{ color: "red", alignItems: "center", width: "50px" }}
          />
        </Link>
        <div className="container">
          <section className="stats">
            <section className="stat">
              <FileUpload
                description="Drag and drop the file here"
                label="Click here to Upload or "
                onChange={handleFileSelected}
                variant="inline"
                onValueChange={(files) => handleFileSelected(files)}
                className="btnstyleUpload"
              />
              <br />
              <ActionButton
                label="Save Annotation as Image"
                onPress={handleAnnotationCoordinates}
                className="btnstyle"
              />
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
            Narashiman - &copy; Copyright ® 2010-2024 PSPDFKit GmbH. All Rights
            Reserved
          </small>
        </footer>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
