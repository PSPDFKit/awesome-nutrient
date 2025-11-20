// src/app.tsx - Fixed accessibility issues with useId and ref
import { useEffect, useId, useRef, useState } from "react";
import DebugPanel from "./components/debug-panel.tsx";
import PdfViewerComponent from "./components/pdf-viewer-component.tsx";
import mixpanelService from "./services/mixpanel.ts";
import "./app.css";

function App() {
  const [document, setDocument] = useState<string>("document.pdf");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("document.pdf");
  const fileInputId = useId(); // unique ID for input
  const fileInputRef = useRef<HTMLInputElement>(null); // ref for programmatic click

  useEffect(() => {
    mixpanelService.trackPageView("PDF Viewer App");
    mixpanelService.trackPDFLoaded("document.pdf", "unknown");
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      setDocument(objectUrl);
      setFileName(file.name);

      mixpanelService.track("File Upload Started", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });

      mixpanelService.trackPDFLoaded(file.name, file.size);
    } catch (error) {
      mixpanelService.track("File Upload Error", {
        error_message: (error as Error).message,
        file_name: file.name,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputClick = () => {
    mixpanelService.track("File Input Clicked");
    fileInputRef.current?.click(); // safer programmatic click
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleFileInputClick();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 className="app-title">PDF Viewer</h1>
          <div className="file-upload-section">
            <label
              htmlFor={fileInputId}
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
              id={fileInputId}
              ref={fileInputRef}
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

