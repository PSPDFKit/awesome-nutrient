// src/app.jsx - Fixed accessibility issues
import { useEffect, useState } from "react";
import DebugPanel from "./components/debug-panel.jsx";
import PdfViewerComponent from "./components/pdf-viewer-component.jsx";
import mixpanelService from "./services/mixpanel.js";
import "./app.css";

function App() {
  const [document, setDocument] = useState("document.pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("document.pdf");

  useEffect(() => {
    // Track app initialization
    mixpanelService.trackPageView("PDF Viewer App");

    // Track initial document load
    mixpanelService.trackPDFLoaded("document.pdf", "unknown");
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      setDocument(objectUrl);
      setFileName(file.name);

      // Track file upload
      mixpanelService.track("File Upload Started", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });

      // Track PDF loaded
      mixpanelService.trackPDFLoaded(file.name, file.size);
    } catch (error) {
      mixpanelService.track("File Upload Error", {
        error_message: error.message,
        file_name: file.name,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputClick = () => {
    mixpanelService.track("File Input Clicked");
  };

  // Handle keyboard navigation for file input
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleFileInputClick();
      document.getElementById("file-input").click();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 className="app-title">PDF Viewer</h1>
          <div className="file-upload-section">
            <label
              htmlFor="file-input"
              className="App-input"
              onClick={handleFileInputClick}
              onKeyDown={handleKeyDown}
              aria-label="Choose PDF document to upload"
            >
              <svg
                className="upload-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <title>Upload icon</title>
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              {isLoading ? "Loading..." : "Choose PDF Document"}
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="chooseFile"
              accept="application/pdf"
              name="pdf"
              style={{ display: "none" }}
              disabled={isLoading}
            />
          </div>
          <div className="current-file">
            Current: <span className="file-name">{fileName}</span>
          </div>
        </div>
      </header>

      <main className="App-viewer">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <p>Loading PDF...</p>
          </div>
        )}
        <PdfViewerComponent
          document={document}
          fileName={fileName}
          onViewerReady={() => mixpanelService.track("PDF Viewer Ready")}
        />
      </main>

      <DebugPanel />
    </div>
  );
}

export default App;
