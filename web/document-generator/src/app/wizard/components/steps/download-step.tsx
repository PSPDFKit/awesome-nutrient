"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadPdf } from "@/lib/utils";
import { useWizard } from "../../context/wizard-context";

export default function DownloadStep() {
  const { state, dispatch } = useWizard();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const initializePdfViewer = useCallback(async () => {
    console.log("🔄 DownloadStep: Initializing PDF viewer");

    if (!viewerRef.current || !state.pdfDocument) {
      console.warn("❌ No viewer ref or PDF document available");
      return;
    }

    // Validate PDF document before proceeding
    try {
      if (!(state.pdfDocument instanceof ArrayBuffer)) {
        throw new Error("PDF document is not an ArrayBuffer");
      }

      if (state.pdfDocument.byteLength === 0) {
        throw new Error("PDF document is empty");
      }

      // Check if ArrayBuffer is detached
      try {
        new Uint8Array(state.pdfDocument);
      } catch (_detachedError) {
        throw new Error("PDF document ArrayBuffer is detached");
      }

      console.log("✅ PDF document validation passed:", {
        type: state.pdfDocument.constructor.name,
        size: state.pdfDocument.byteLength,
        isDetached: false,
      });
    } catch (validationError) {
      console.error("❌ PDF document validation failed:", validationError);
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : "Unknown validation error";
      dispatch({
        type: "SET_ERROR",
        payload: `PDF document validation failed: ${errorMessage}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const container = viewerRef.current;

      // Clear any existing content and ensure container is clean
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Force cleanup of any existing PSPDFKit instances
      if (window.PSPDFKit) {
        try {
          // Try multiple cleanup approaches
          await window.PSPDFKit.unload(container);
          console.log("🧹 Unloaded PSPDFKit from container element");
        } catch (_unloadError1) {
          try {
            // Try unloading by CSS selector - but skip since PSPDFKit.unload expects element
            console.log("ℹ️ Skipping CSS selector unload (not supported)");
          } catch (_unloadError2) {
            console.log(
              "ℹ️ No existing PSPDFKit instance to unload (this is normal)",
            );
          }
        }

        // Clear the viewer from state regardless
        dispatch({ type: "SET_PDF_VIEWER", payload: null });

        // Wait a bit for cleanup to complete
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Ensure container has proper styling and dimensions (fix positioning warnings)
      container.style.width = "100%";
      container.style.height = "500px";
      container.style.position = "relative";
      container.style.overflow = "hidden";

      // Give the container a static ID for NutrientViewer
      const containerId = "pdf-viewer-container";
      container.id = containerId;

      // Validate container before loading
      if (!container.isConnected) {
        throw new Error("Container is not connected to DOM");
      }

      // Wait for DOM to process the ID update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify the container can be found by CSS selector
      const foundContainer = document.getElementById(containerId);
      if (!foundContainer) {
        throw new Error(`Container with ID ${containerId} not found in DOM`);
      }

      console.log("🔍 Container validation:", {
        containerId,
        hasId: !!container.id,
        isConnected: container.isConnected,
        foundById: !!foundContainer,
        containerRect: container.getBoundingClientRect(),
      });

      // Load the PDF into NutrientViewer with retry logic
      if (window.NutrientViewer) {
        console.log("📄 Loading PDF into NutrientViewer...");

        let viewer: any = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            // Create a fresh copy of the PDF document to ensure it's not detached
            const pdfDocumentCopy = state.pdfDocument.slice();

            const viewerConfig: {
              container: string;
              document: ArrayBuffer;
              licenseKey?: string;
            } = {
              container: `#${containerId}`, // Use CSS selector as expected by NutrientViewer
              document: pdfDocumentCopy,
              licenseKey: process.env.NEXT_PUBLIC_NUTRIENT_LICENSE_KEY,
            };

            viewer = await window.NutrientViewer.load(viewerConfig);
            console.log("✅ PDF viewer initialized successfully");
            break;
          } catch (loadError) {
            retryCount++;
            console.warn(
              `⚠️ PDF viewer load attempt ${retryCount} failed:`,
              loadError,
            );

            if (retryCount < maxRetries) {
              // Try more aggressive cleanup before retry
              try {
                await window.PSPDFKit.unload(container);
              } catch (_cleanupError) {
                // Ignore cleanup errors
              }

              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, 500 * retryCount),
              );
            } else {
              throw loadError;
            }
          }
        }

        if (viewer) {
          dispatch({ type: "SET_PDF_VIEWER", payload: viewer });
        } else {
          throw new Error("Failed to initialize PDF viewer after retries");
        }
      } else {
        console.error("❌ NutrientViewer not available");
        throw new Error("NutrientViewer not loaded");
      }
    } catch (error) {
      console.error("❌ Error initializing PDF viewer:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "PDF viewer initialization failed",
      });
    } finally {
      setIsLoading(false);
    }
  }, [state.pdfDocument, dispatch]);

  // Use a ref to track if we're already initializing to prevent double-initialization
  const isInitializingRef = useRef(false);

  useEffect(() => {
    // Capture the current ref value
    const currentViewer = viewerRef.current;

    // Only initialize if we have PDF document and no existing viewer and not already initializing
    if (state.pdfDocument && !state.pdfViewer && !isInitializingRef.current) {
      isInitializingRef.current = true;
      initializePdfViewer().finally(() => {
        isInitializingRef.current = false;
      });
    }

    // Cleanup function
    return () => {
      if (currentViewer && window.PSPDFKit && state.pdfViewer) {
        console.log("🧹 Cleaning up PDF viewer");
        try {
          window.PSPDFKit.unload(currentViewer);
        } catch (error) {
          console.warn("⚠️ PDF viewer cleanup error:", error);
        }
      }
    };
  }, [state.pdfDocument, state.pdfViewer, initializePdfViewer]); // Include all dependencies

  const handleDownloadPdf = useCallback(async () => {
    if (!state.pdfDocument) {
      console.warn("❌ No PDF document available for download");
      return;
    }

    setIsDownloading(true);
    try {
      console.log("💾 Downloading PDF...");
      const blob = new Blob([state.pdfDocument], { type: "application/pdf" });
      downloadPdf(blob, "generated-document.pdf");
      console.log("✅ PDF download initiated");
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to download PDF" });
    } finally {
      setIsDownloading(false);
    }
  }, [state.pdfDocument, dispatch]);

  const handleDownloadDocx = useCallback(async () => {
    if (!state.docxDocument) {
      console.warn("❌ No DOCX document available for download");
      return;
    }

    setIsDownloading(true);
    try {
      console.log("💾 Downloading DOCX...");
      const docxBuffer = await state.docxDocument.exportDOCX();
      const blob = new Blob([docxBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-document.docx";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("✅ DOCX download initiated");
    } catch (error) {
      console.error("❌ Error downloading DOCX:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to download DOCX" });
    } finally {
      setIsDownloading(false);
    }
  }, [state.docxDocument, dispatch]);

  const handleReset = () => {
    // Clean up viewers before resetting
    if (viewerRef.current && window.PSPDFKit) {
      try {
        window.PSPDFKit.unload(viewerRef.current);
        dispatch({ type: "SET_PDF_VIEWER", payload: null });
      } catch (error) {
        console.warn("⚠️ Error cleaning up PDF viewer during reset:", error);
      }
    }
    dispatch({ type: "RESET_WIZARD" });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 Your Document is Ready!
        </h2>
        <p className="text-lg text-gray-600">
          Preview your document and download it in your preferred format
        </p>
      </div>

      {/* PDF Viewer */}
      {state.pdfDocument && (
        <div className="bg-white border border-gray-200 rounded-xl min-h-[600px] relative overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Document Preview
            </h3>
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading PDF viewer...</p>
              </div>
            </div>
          )}
          {state.error && (
            <div className="absolute top-16 left-4 right-4 z-10">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{state.error}</span>
              </div>
            </div>
          )}
          <div
            ref={viewerRef}
            id="pdf-viewer-container"
            className="w-full h-[500px]"
            style={{
              minHeight: "500px",
              position: "relative",
              overflow: "hidden",
            }}
          />
        </div>
      )}

      {/* Download Options */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Document Generated Successfully
        </h3>
        <p className="text-gray-600 mb-6">
          Your {state.template} document has been created with your custom data
        </p>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
            disabled={isDownloading || !state.pdfDocument}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Download PDF</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadDocx}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
            disabled={isDownloading || !state.docxDocument}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Download DOCX</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 20h6"
                  />
                </svg>
                Download DOCX
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">
            {state.template || "N/A"}
          </div>
          <div className="text-sm text-gray-600">Template Used</div>
        </div>
        <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">
            {state.dataJson
              ? Object.keys(state.dataJson.model || {}).length
              : 0}
          </div>
          <div className="text-sm text-gray-600">Data Fields</div>
        </div>
        <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">
            {state.pdfDocument
              ? `${Math.round(state.pdfDocument.byteLength / 1024)} KB`
              : "N/A"}
          </div>
          <div className="text-sm text-gray-600">PDF Size</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Start over</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Create Another Document
        </button>
      </div>
    </div>
  );
}
