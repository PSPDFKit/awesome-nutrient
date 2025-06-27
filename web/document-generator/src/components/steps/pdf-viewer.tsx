"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { STEP_TITLES } from "@/lib/constants";
import { downloadPdf } from "@/lib/utils";
import type { AppState } from "@/types";

interface PdfViewerProps {
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  navigateToStep: (step: "docx-editor") => Promise<void>;
}

export default function PdfViewer({
  appState,
  updateAppState,
  navigateToStep,
}: PdfViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const initializePdfViewer = useCallback(async () => {
    if (!viewerRef.current || !appState.docxDocument) return;

    setIsLoading(true);
    try {
      // Generate PDF from DOCX document
      const pdfBuffer = await appState.docxDocument.exportPDF();

      // Load the PDF into Web SDK viewer
      if (window.NutrientViewer && viewerRef.current) {
        // Give the container a unique ID for NutrientViewer
        const containerId = "pdf-viewer-container";
        viewerRef.current.id = containerId;

        const viewerConfig: {
          container: string;
          document: ArrayBuffer;
          licenseKey?: string;
        } = {
          container: `#${containerId}`,
          document: pdfBuffer,
          licenseKey: process.env.NEXT_PUBLIC_NUTRIENT_LICENSE_KEY,
        };

        const viewer = await window.NutrientViewer.load(viewerConfig);
        updateAppState({ pdfViewer: viewer });
      }
    } catch (error) {
      console.error("Error initializing PDF viewer:", error);
    } finally {
      setIsLoading(false);
    }
  }, [appState.docxDocument, updateAppState]);

  useEffect(() => {
    initializePdfViewer();

    // Cleanup function
    return () => {
      if (appState.pdfViewer && window.PSPDFKit) {
        window.PSPDFKit.unload(appState.pdfViewer);
        updateAppState({ pdfViewer: null });
      }
    };
  }, [appState.pdfViewer, initializePdfViewer, updateAppState]);

  const handleBackToDocx = useCallback(async () => {
    if (appState.pdfViewer && window.PSPDFKit) {
      await window.PSPDFKit.unload(appState.pdfViewer);
    }
    updateAppState({ pdfViewer: null });
    await navigateToStep("docx-editor");
  }, [appState.pdfViewer, updateAppState, navigateToStep]);

  const handleDownloadPdf = useCallback(async () => {
    if (!appState.pdfViewer) return;

    setIsDownloading(true);
    try {
      const buffer = await appState.pdfViewer.exportPDF();
      const blob = new Blob([buffer], { type: "application/pdf" });
      downloadPdf(blob, "generated-document.pdf");
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [appState.pdfViewer]);

  return (
    <div className="nutri-card">
      <div className="nutri-card-header">
        <h2 className="text-2xl font-bold">{STEP_TITLES["pdf-viewer"]}</h2>
      </div>

      <div className="nutri-card-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutrient-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Loading PDF viewer...</p>
            </div>
          </div>
        ) : (
          <div ref={viewerRef} className="nutri-viewer" />
        )}
      </div>

      <div className="nutri-card-footer">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBackToDocx}
            className="nutri-button-secondary"
            disabled={isLoading}
          >
            ← Edit DOCX
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="nutri-button-primary"
            disabled={isLoading || isDownloading || !appState.pdfViewer}
          >
            {isDownloading ? "Downloading..." : "Download PDF →"}
          </button>
        </div>
      </div>
    </div>
  );
}
