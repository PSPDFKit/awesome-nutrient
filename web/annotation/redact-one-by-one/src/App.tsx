import { useState } from "react";
import PdfViewerComponent from "./components/PdfViewerComponent";
import "./App.css";
import {
  ThemeProvider,
  I18nProvider,
  Link,
  Avatar,
  FileUpload,
} from "@baseline-ui/core";

function App() {
  const [document, setDocument] = useState<string>("document1.pdf");
  const [toolbar, setToolbar] = useState<string>("default");

  const handleFileSelected = (files) => {
    if (files && files.length > 0) {
      const fileUrl = URL.createObjectURL(files[0]);
      setDocument(fileUrl);
      setToolbar("default");
    }
  };

  return (
    <>
      <ThemeProvider>
        <I18nProvider locale="en-US">
          <header>
          <Link
              href="https://pspdfkit.com"
              target="_blank"
              size="lg"
              style={{ color: "white", width: "50px" }}
            >
            <h1>Redact one by one on Marked Annotation</h1>
            </Link>
          </header>
          <div className="container">
            <div className="left-column">
              <FileUpload
                label="Click here to Upload"
                onChange={handleFileSelected}
                variant="inline"
                className="btnstyle"
                onValueChange={(files) => handleFileSelected(files)}
              />
              <br></br>
            </div>
            <div className="right-column">
              <PdfViewerComponent document={document} toolbar={toolbar} />
            </div>
          </div>
          <footer>
            <p>© Copyright ® 2010-2024 PSPDFKit GmbH. All Rights Reserved</p>
            <p> Solution Engineer : Narashiman</p>
          </footer>
        </I18nProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
