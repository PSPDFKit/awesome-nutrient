import { useCallback, useEffect, useRef, useState } from "react";
import "./app.css";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Initializing...");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to upload local file and get session token
  const uploadFile = async (file: File) => {
    try {
      setStatus("Uploading file...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:3001/api/upload-and-create-session",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setSessionToken(result.sessionToken);
      return result.sessionToken;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Function to load PDF using session token
  const loadPDFWithSession = useCallback(async (token: string) => {
    try {
      const container = containerRef.current;

      // Load SDK using local installation
      const NutrientViewer = (await import("@nutrient-sdk/viewer")).default;

      // Ensure there's only one NutrientViewer instance
      NutrientViewer.unload(container);

      // Verify container has dimensions
      if (!container) {
        throw new Error("Container ref is not available");
      }

      setStatus("Loading PDF with session token...");

      // Load PDF using DWS Viewer API session token
      if (container && NutrientViewer) {
        await NutrientViewer.load({
          container,
          // Use session token instead of document URL for DWS API
          session: token,
          // baseUrl: where SDK should load its assets from
          baseUrl: `${window.location.protocol}//${window.location.host}/${
            import.meta.env.PUBLIC_URL ?? ""
          }`,
        });
      }

      setStatus("PDF loaded successfully via DWS Viewer API!");

      return () => {
        NutrientViewer.unload(container);
      };
    } catch (error) {
      console.error("PDF loading failed:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }, []);

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const token = await uploadFile(file);
        await loadPDFWithSession(token);
      } catch (error) {
        setStatus(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  };

  // Function to convert PDF to Excel
  const convertToExcel = async () => {
    try {
      if (!sessionToken) {
        setStatus("Error: Please upload a document first");
        return;
      }

      setStatus("Converting PDF to Excel...");

      // Use a smaller sample PDF that fits within storage limits
      const documentUrl =
        "https://www.nutrient.io/downloads/nutrient-web-demo.pdf";

      const response = await fetch(
        "http://localhost:3001/api/convert-to-excel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: documentUrl }),
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Conversion failed" }));
        throw new Error(errorData.error || "Failed to convert PDF to Excel");
      }

      // Get the Excel file as blob
      const excelBlob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "extracted_tables.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setStatus("Excel file downloaded successfully!");

      // Reset status after a few seconds
      setTimeout(() => {
        setStatus("PDF loaded successfully via DWS Viewer API!");
      }, 3000);
    } catch (error) {
      console.error("Excel conversion error:", error);
      setStatus(
        `Error converting to Excel: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // Function to cleanup old documents
  const cleanupDocuments = async () => {
    try {
      setStatus("Cleaning up old documents...");

      const response = await fetch(
        "http://localhost:3001/api/cleanup-documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Cleanup failed");
      }

      setStatus(`Cleanup successful: ${result.message}`);

      // Reset status after a few seconds
      setTimeout(() => {
        setStatus("Ready - documents cleaned up!");
      }, 4000);
    } catch (error) {
      console.error("Cleanup error:", error);
      setStatus(
        `Error cleaning up documents: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // Initialize component without auto-loading any document
  useEffect(() => {
    setStatus("Ready - Upload a file to get started");
  }, []);

  return (
    <div>
      <div className="status-bar">
        <span className="status-text">Status: {status}</span>
        <div className="controls-group">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="file-input-hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="control-button control-button-upload"
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={convertToExcel}
            className="control-button control-button-export"
          >
            Export to Excel
          </button>
          <button
            type="button"
            onClick={cleanupDocuments}
            className="control-button control-button-cleanup"
          >
            Cleanup Documents
          </button>
          {sessionToken && (
            <span className="session-token">
              Session: {sessionToken.substring(0, 20)}...
            </span>
          )}
        </div>
      </div>
      <div ref={containerRef} className="pdf-container" />
    </div>
  );
}

export default App;
