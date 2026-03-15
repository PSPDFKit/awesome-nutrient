import React from "react";

const WidgetOverlay = ({
  annotation,
  customData,
  boundingBox,
  onUpdate,
  onDelete,
  children,
  className = "",
  style = {},
}) => {
  const defaultStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f9fa",
    color: "#333",
    border: "2px solid #007bff",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "relative",
    ...style,
  };

  const handleTextChange = (newText) => {
    if (onUpdate) {
      onUpdate({ text: newText });
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className={`widget-overlay ${className}`} style={defaultStyle}>
      {/* Delete button */}
      <button
        onClick={handleDeleteClick}
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          width: "20px",
          height: "20px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "50%",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          lineHeight: "1",
        }}
        title="Delete widget"
      >
        ×
      </button>

      {/* Resize handles */}
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          right: "-6px",
          width: "12px",
          height: "12px",
          backgroundColor: "#007bff",
          cursor: "se-resize",
          borderRadius: "2px",
          border: "1px solid white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />

      {/* Content */}
      {children || (
        <div style={{ padding: "4px", pointerEvents: "none" }}>
          {customData?.text || "Widget"}
        </div>
      )}
    </div>
  );
};

export default WidgetOverlay;