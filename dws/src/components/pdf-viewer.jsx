import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

const PDFViewer = ({ sessionToken }) => {
  const containerRef = useRef(null);
  const [viewerInstance, setViewerInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let instance = null;

    const loadViewer = async () => {
      if (!sessionToken || !containerRef.current) return;

      setLoading(true);
      setError(null);

      try {
        // Clear any existing instance
        if (viewerInstance) {
          await viewerInstance.unload();
          setViewerInstance(null);
        }

        // Clear container
        containerRef.current.innerHTML = "";

        // Wait for NutrientViewer to be available
        if (typeof window.NutrientViewer === "undefined") {
          throw new Error(
            "NutrientViewer is not loaded. Please check the CDN script in index.html.",
          );
        }

        // Initialize viewer with session token
        instance = await window.NutrientViewer.load({
          container: containerRef.current,
          sessionToken: sessionToken,
          baseUrl: "https://api.nutrient.io/",
          // Configure viewer options
          theme: window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
          toolbarItems: [
            "sidebar-thumbnails",
            "sidebar-document-outline",
            "sidebar-annotations",
            "pager",
            "pan",
            "zoom-out",
            "zoom-in",
            "zoom-mode",
            "spacer",
            "search",
            "print",
            "download",
          ],
          annotationToolbarItems: [
            "ink",
            "highlighter",
            "text",
            "note",
            "rectangle",
            "ellipse",
            "line",
            "arrow",
            "polyline",
            "polygon",
            "cloudy-polygon",
            "image",
            "stamp",
            "signature",
          ],
          enableAnnotationToolbar: true,
          enableFormDesignMode: true,
          locale: "en",
        });

        setViewerInstance(instance);
        setLoading(false);

        // Handle viewer events
        instance.addEventListener(
          "viewState.currentPageIndex.change",
          (pageIndex) => {
            console.log("Page changed:", pageIndex);
          },
        );

        instance.addEventListener("annotations.create", (annotation) => {
          console.log("Annotation created:", annotation);
        });

        instance.addEventListener("document.loaded", () => {
          console.log("Document fully loaded");
        });
      } catch (err) {
        console.error("Failed to load PDF viewer:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadViewer();

    // Cleanup function
    return () => {
      if (instance) {
        instance.unload().catch(console.error);
      }
    };
  }, [sessionToken, viewerInstance]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#667eea",
          fontSize: "1.1rem",
        }}
      >
        Loading PDF viewer...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#dc3545",
          fontSize: "1.1rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <div style={{ marginBottom: "1rem" }}>Failed to load PDF viewer</div>
          <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "600px",
      }}
    />
  );
};

PDFViewer.propTypes = {
  sessionToken: PropTypes.string.isRequired,
};

export default PDFViewer;
