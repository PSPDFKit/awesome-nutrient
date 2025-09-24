import { useEffect, useRef, useState } from "react";
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

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error(
          `Container has no dimensions: ${rect.width}x${rect.height}. Check your CSS.`,
        );
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
      <div
        style={{
          padding: "10px",
          background: "#f0f0f0",
          borderBottom: "1px solid #ccc",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#000000",
            backgroundColor: "#ffffff",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontWeight: "500",
          }}
        >
          Status: {status}
        </span>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "5px 10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={convertToExcel}
            style={{
              padding: "5px 10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Export to Excel
          </button>
          <button
            type="button"
            onClick={cleanupDocuments}
            style={{
              padding: "5px 10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Cleanup Documents
          </button>
          {sessionToken && (
            <span
              style={{
                fontSize: "10px",
                color: "#666",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Session: {sessionToken.substring(0, 20)}...
            </span>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          height: "calc(100vh - 60px)",
          width: "100vw",
          background: "#e0e0e0",
        }}
      />
    </div>
  );
}

export default App;
