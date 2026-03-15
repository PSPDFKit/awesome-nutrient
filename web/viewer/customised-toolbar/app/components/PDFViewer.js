"use client";
import React, { useEffect, useRef, useState } from "react";

// Tool configuration
const TOOLS = [
  { id: 'select', icon: '/icons/select.svg', label: 'Select', mode: 'MULTI_ANNOTATIONS_SELECTION' },
  { id: 'text', icon: '/icons/text.svg', label: 'Text', mode: 'TEXT' },
  { id: 'note', icon: '/icons/note.svg', label: 'Note', mode: 'NOTE' },
  { id: 'ink', icon: '/icons/ink.svg', label: 'Ink', mode: 'INK' },
  { id: 'line', icon: '/icons/line.svg', label: 'Line', mode: 'SHAPE_LINE' },
  { id: 'polygon', icon: '/icons/polygon.svg', label: 'Polygon', mode: 'SHAPE_POLYGON' },
  { id: 'cloudy_polygon', icon: '/icons/cloudy_polygon.svg', label: 'Cloudy Polygon', mode: 'SHAPE_POLYGON', preset: 'cloudy-polygon' },
  { id: 'rectangle', icon: '/icons/rectangle.svg', label: 'Rectangle', mode: 'SHAPE_RECTANGLE' },
  { id: 'ellipse', icon: '/icons/ellipse.svg', label: 'Ellipse', mode: 'SHAPE_ELLIPSE' },
  { id: 'measurement', icon: '/icons/measurement.svg', label: 'Measurement', mode: 'MEASUREMENT' },
  { id: 'measurement_settings', icon: '/icons/measurement_settings.svg', label: 'Measurement Settings', mode: 'MEASUREMENT_SETTINGS' },
];

// Create mapping from interaction mode to tool ID
const createModeToToolMap = (NutrientViewer) => {
  const map = {};
  TOOLS.forEach(tool => {
    const mode = NutrientViewer.InteractionMode[tool.mode];
    if (mode && !tool.preset) {  // Only map tools without presets
      map[mode] = tool.id;
    }
  });
  return map;
};

// Toggle tool activation
const toggleTool = (instance, NutrientViewer, toolId, setActiveTool, activeTool) => {
  if (!instance) return;

  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;

  const targetMode = NutrientViewer.InteractionMode[tool.mode];

  if (activeTool === toolId) {
    // Deactivate current tool
    instance.setViewState(viewState => viewState.set("interactionMode", null));
    setActiveTool(null);
  } else {
    // If tool has a preset, set it first
    if (tool.preset) {
      instance.setCurrentAnnotationPreset(tool.preset);
    }
    // Activate new tool
    instance.setViewState(viewState => viewState.set("interactionMode", targetMode));
    // Manually set the active tool for tools with presets
    setActiveTool(toolId);
  }
};

// Toolbar Button Component
const ToolbarButton = ({ tool, isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      title={tool?.label}
      className={`toolbar-button ${isActive ? 'active' : ''}`}
    >
      {children || (
        <img
          src={tool.icon}
          alt={tool.label}
          className="toolbar-button-icon"
        />
      )}
    </button>
  );
};

// Document Comparison Button Component
const ComparisonButton = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      title={isActive ? "Exit Comparison Mode" : "Compare Documents"}
      className={`toolbar-button ${isActive ? 'active' : ''}`}
    >
      <img
        src="/icons/compare.svg"
        alt="Compare Documents"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Comparison Configuration Button Component
const ComparisonConfigButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Comparison Configuration"
      className="toolbar-button"
    >
      <img
        src="/icons/config.svg"
        alt="Comparison Configuration"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Zoom In Button Component
const ZoomInButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Zoom In"
      className="toolbar-button"
    >
      <img
        src="/icons/zoom-in.svg"
        alt="Zoom In"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Zoom Out Button Component
const ZoomOutButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Zoom Out"
      className="toolbar-button"
    >
      <img
        src="/icons/zoom-out.svg"
        alt="Zoom Out"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Back button component for toolbar
const ToolbarBackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Back to Upload"
      className="toolbar-button toolbar-back-button"
    >
      <img
        src="/icons/back-arrow.svg"
        alt="Back"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Vertical Toolbar Component
const VerticalToolbar = ({ tools, activeTool, onToolClick, onCompareClick, onComparisonConfigClick, onZoomIn, onZoomOut, onBack, isInComparisonMode }) => {
  return (
    <div className="toolbar-container">
      <div className="toolbar-scroll-content">
        <ToolbarBackButton onClick={onBack} />
        <div className="toolbar-separator" />
        <ZoomInButton onClick={onZoomIn} />
        <ZoomOutButton onClick={onZoomOut} />
        <div className="toolbar-separator" />
        {tools.map((tool) => (
          <ToolbarButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
        <div className="toolbar-separator" />
        <ComparisonButton onClick={onCompareClick} isActive={isInComparisonMode} />
        <ComparisonConfigButton onClick={onComparisonConfigClick} />
      </div>
    </div>
  );
};

// Comparison Configuration Modal Component
const ComparisonConfigModal = ({ show, colors, blendMode, onColorChange, onBlendModeChange, onClose, onApply, isInComparisonMode }) => {
  if (!show) return null;

  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay',
    'darken', 'lighten', 'colorDodge', 'colorBurn',
    'hardLight', 'softLight', 'difference', 'exclusion'
  ];

  return (
    <div className="comparison-config-modal-overlay" onClick={onClose}>
      <div className="comparison-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-config-modal-header">
          <h3>Comparison Configuration</h3>
          <button className="comparison-config-close" onClick={onClose}>×</button>
        </div>
        <div className="comparison-config-modal-body">
          <p className="comparison-config-description">
            Configure settings for document comparison mode
          </p>

          {/* Color configuration */}
          <div className="comparison-config-inputs">
              <div className="comparison-input-group">
                <label htmlFor="modalColorA">Document A:</label>
                <div className="comparison-input-wrapper">
                  <input
                    type="color"
                    id="modalColorA"
                    value={colors.documentA}
                    onChange={(e) => onColorChange('documentA', e.target.value)}
                    className="comparison-color-input"
                  />
                  <span className="comparison-color-value">{colors.documentA}</span>
                </div>
              </div>

              <div className="comparison-input-group">
                <label htmlFor="modalColorB">Document B:</label>
                <div className="comparison-input-wrapper">
                  <input
                    type="color"
                    id="modalColorB"
                    value={colors.documentB}
                    onChange={(e) => onColorChange('documentB', e.target.value)}
                    className="comparison-color-input"
                  />
                  <span className="comparison-color-value">{colors.documentB}</span>
                </div>
              </div>
            </div>

          {/* Blend Mode Selection */}
          <div className="comparison-config-section">
            <label className="comparison-config-label">Blend Mode</label>
            <select
              value={blendMode}
              onChange={(e) => onBlendModeChange(e.target.value)}
              className="comparison-config-select"
            >
              {blendModes.map(mode => (
                <option key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/([A-Z])/g, ' $1')}
                </option>
              ))}
            </select>
            <p className="comparison-config-hint">
              Choose how the documents blend when overlapped
            </p>
          </div>

          {/* Apply Button - only show when in comparison mode */}
          {isInComparisonMode && (
            <div className="comparison-config-actions">
              <button
                onClick={onApply}
                className="comparison-config-apply-button"
              >
                Apply
              </button>
              <button
                onClick={onClose}
                className="comparison-config-cancel-button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const PDFViewer = ({ documentUrl, onBack, noZoomEnabled = false }) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComparisonConfig, setShowComparisonConfig] = useState(false);
  const [comparisonColors, setComparisonColors] = useState({
    documentA: '#FF0000',
    documentB: '#0000FF'
  });
  const [isInComparisonMode, setIsInComparisonMode] = useState(false);
  const [comparisonDocumentB, setComparisonDocumentB] = useState(null);
  const [blendMode, setBlendMode] = useState('normal');

  useEffect(() => {
    const container = containerRef.current;
    const { NutrientViewer } = window;

    if (!container || !NutrientViewer) return;

    setIsLoading(true);
    setError(null);

    // Detect system theme preference
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    NutrientViewer.load({
      container,
      document: documentUrl,
      licenseKey: process.env.NEXT_PUBLIC_NUTRIENT_LICENSE_KEY,
      theme: isDarkMode ? NutrientViewer.Theme.DARK : NutrientViewer.Theme.LIGHT,
    }).then((instance) => {
      instanceRef.current = instance;
      setIsLoading(false);

      // Hide default toolbar
      instance.setViewState(viewState => viewState.set("showToolbar", false));

      // Sync toolbar state with viewer state changes
      const modeToToolMap = createModeToToolMap(NutrientViewer);
      instance.addEventListener("viewState.change", (viewState) => {
        const currentMode = viewState.get("interactionMode");
        const toolId = modeToToolMap[currentMode] || null;
        setActiveTool(toolId);
      });

      // Track comparison mode state
      instance.addEventListener("documentComparisonUI.start", () => {
        setIsInComparisonMode(true);
      });

      instance.addEventListener("documentComparisonUI.end", () => {
        setIsInComparisonMode(false);
        // setComparisonDocumentB(null);
      });

      // If noZoom is enabled, set up the event listener for new annotations
      if (noZoomEnabled) {
        instance.addEventListener("annotations.create", (createdAnnotations) => {
          createdAnnotations
            .filter(annotation =>
              annotation instanceof NutrientViewer.Annotations.StampAnnotation ||
              (annotation instanceof NutrientViewer.Annotations.TextAnnotation && !annotation.callout)
            )
            .forEach(annotation => {
              instance.update(annotation.set("noZoom", true));
            });
        });

        // Apply noZoom to existing annotations
        (async () => {
          const pagesAnnotations = await Promise.all(
            Array.from({ length: instance.totalPageCount })
              .map((_, pageIndex) => instance.getAnnotations(pageIndex))
          );
          await Promise.all(
            pagesAnnotations.flatMap((pageAnnotations) =>
              pageAnnotations
                .filter(annotation =>
                  annotation instanceof NutrientViewer.Annotations.StampAnnotation ||
                  annotation instanceof NutrientViewer.Annotations.TextAnnotation
                )
                .map(annotation => instance.update(annotation.set("noZoom", true)))
            )
          );
        })();
      }
    }).catch((err) => {
      console.error("Failed to load PDF:", err);
      setError("Failed to load PDF. Please try again.");
      setIsLoading(false);
    });

    return () => {
      NutrientViewer?.unload(container);
    };
  }, [documentUrl, noZoomEnabled]);

  const handleToolClick = (toolId) => {
    const { NutrientViewer } = window;
    toggleTool(instanceRef.current, NutrientViewer, toolId, setActiveTool, activeTool);
  };

  const handleCompareDocuments = () => {
    const instance = instanceRef.current;
    const { NutrientViewer } = window;

    if (!instance || !NutrientViewer) return;

    if (isInComparisonMode) {
      // Exit comparison mode
      instance.setDocumentComparisonMode(null).then(() => {
        console.log("Exited comparison mode");
      }).catch((err) => {
        console.error("Failed to exit comparison mode:", err);
      });
    } else {
      // Enter comparison mode - trigger file input dialog
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleComparisonConfigClick = () => {
    setShowComparisonConfig(true);
  };

  const handleZoomIn = () => {
    const instance = instanceRef.current;
    if (instance) {
      instance.setViewState((viewState) => viewState.zoomIn());
    }
  };

  const handleZoomOut = () => {
    const instance = instanceRef.current;
    if (instance) {
      instance.setViewState((viewState) => viewState.zoomOut());
    }
  };

  const applyComparisonColors = async () => {
    const instance = instanceRef.current;
    const { NutrientViewer } = window;

    if (!instance || !NutrientViewer || !isInComparisonMode || !comparisonDocumentB) {
      console.log("Cannot apply colors - not in comparison mode or missing document");
      return;
    }

    // Create a fresh ArrayBuffer from the stored File object
    const arrayBuffer = await comparisonDocumentB.arrayBuffer();

    // Build comparison config with new colors
    const comparisonConfig = {
      documentA: {
        source: NutrientViewer.DocumentComparisonSourceType.USE_OPEN_DOCUMENT
      },
      documentB: {
        source: arrayBuffer
      },
      autoCompare: true
    };

    // Add stroke colors
    comparisonConfig.strokeColors = {};

    const colorA = hexToRgb(comparisonColors.documentA);
    if (colorA) {
      comparisonConfig.strokeColors.documentA = new NutrientViewer.Color(colorA);
    }

    const colorB = hexToRgb(comparisonColors.documentB);
    if (colorB) {
      comparisonConfig.strokeColors.documentB = new NutrientViewer.Color(colorB);
    }

    // Add blend mode
    comparisonConfig.blendMode = blendMode;

    instance.setDocumentComparisonMode(null).then(()=>{
// Re-apply comparison mode with new configuration
    instance.setDocumentComparisonMode(comparisonConfig).then(() => {
      console.log("Successfully applied comparison configuration");
      setShowComparisonConfig(false);
    })
    })
    
  };

  const handleColorChange = (document, color) => {
    setComparisonColors(prev => ({
      ...prev,
      [document]: color
    }));
  };

  const handleBlendModeChange = (mode) => {
    setBlendMode(mode);
  };

  const handleComparisonFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const instance = instanceRef.current;
    const { NutrientViewer } = window;

    if (!instance || !NutrientViewer) return;

    // Store the File object itself (not ArrayBuffer) for reuse
    setComparisonDocumentB(file);

    // Convert file to ArrayBuffer for immediate use
    const arrayBuffer = await file.arrayBuffer();

    // Build comparison config with the selected file
    const comparisonConfig = {
      documentA: {
        source: NutrientViewer.DocumentComparisonSourceType.USE_OPEN_DOCUMENT
      },
      documentB: {
        source: arrayBuffer
      },
      autoCompare: true
    };

    // Add stroke colors
    comparisonConfig.strokeColors = {};

    const colorA = hexToRgb(comparisonColors.documentA);
    if (colorA) {
      comparisonConfig.strokeColors.documentA = new NutrientViewer.Color(colorA);
    }

    const colorB = hexToRgb(comparisonColors.documentB);
    if (colorB) {
      comparisonConfig.strokeColors.documentB = new NutrientViewer.Color(colorB);
    }

    // Add blend mode
    comparisonConfig.blendMode = blendMode;

    // Set document comparison mode
    instance.setDocumentComparisonMode(comparisonConfig).catch((err) => {
      console.error("Failed to enter comparison mode:", err);
      setComparisonDocumentB(null);
    });

    // Reset the file input for future selections
    event.target.value = '';
  };

  if (error) {
    return (
      <div className="pdf-viewer-error-container">
        <p className="pdf-viewer-error-text">{error}</p>
        <button
          onClick={onBack}
          className="pdf-viewer-error-button"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {!isLoading && (
        <VerticalToolbar
          tools={TOOLS}
          activeTool={activeTool}
          onToolClick={handleToolClick}
          onCompareClick={handleCompareDocuments}
          onComparisonConfigClick={handleComparisonConfigClick}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onBack={onBack}
          isInComparisonMode={isInComparisonMode}
        />
      )}
      <div ref={containerRef} className="pdf-viewer-content" />
      {isLoading && (
        <div className="pdf-viewer-loading">
          Loading PDF...
        </div>
      )}
      {/* Hidden file input for document comparison */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleComparisonFileSelect}
        style={{ display: 'none' }}
      />
      {/* Comparison Configuration Modal */}
      <ComparisonConfigModal
        show={showComparisonConfig}
        colors={comparisonColors}
        blendMode={blendMode}
        onColorChange={handleColorChange}
        onBlendModeChange={handleBlendModeChange}
        onClose={() => setShowComparisonConfig(false)}
        onApply={applyComparisonColors}
        isInComparisonMode={isInComparisonMode}
      />
    </div>
  );
};

export default PDFViewer;