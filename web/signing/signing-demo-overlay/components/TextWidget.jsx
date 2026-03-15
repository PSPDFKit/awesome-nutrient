import React, { useState } from "react";
import WidgetOverlay from "./WidgetOverlay";

export const TextWidget = ({
  annotation,
  customData,
  boundingBox,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(customData?.text || "Enter text");
  const [tempText, setTempText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempText(text);
  };

  const handleSave = () => {
    setText(tempText);
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({ text: tempText });
    }
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <WidgetOverlay
      annotation={annotation}
      customData={customData}
      boundingBox={boundingBox}
      onUpdate={onUpdate}
      onDelete={onDelete}
      style={{
        backgroundColor: "#fff",
        borderColor: "#6c757d",
        borderStyle: "dashed",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          position: "relative",
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <div style={{ width: "100%", height: "100%" }}>
            <textarea
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              autoFocus
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                backgroundColor: "transparent",
                fontSize: "12px",
                fontFamily: "inherit",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              fontSize: "12px",
              textAlign: "center",
              color: text === "Enter text" ? "#6c757d" : "#333",
              fontStyle: text === "Enter text" ? "italic" : "normal",
              cursor: "text",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
            title="Double-click to edit"
          >
            {text}
          </div>
        )}

        {/* Edit indicator */}
        {!isEditing && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              fontSize: "10px",
              color: "#6c757d",
              opacity: 0.7,
            }}
          >
            ✏️
          </div>
        )}
      </div>
    </WidgetOverlay>
  );
};

export default TextWidget;