import React from "react";
import WidgetOverlay from "./WidgetOverlay";

const SignatureWidget = ({ annotation, customData, onUpdate, onDelete }) => {
  const handleSignature = () => {
    const isSigned = customData.signed;
    onUpdate({
      signed: !isSigned,
      signedAt: !isSigned ? new Date().toISOString() : null,
    });
  };

  return (
    <WidgetOverlay
      annotation={annotation}
      customData={customData}
      onUpdate={onUpdate}
      onDelete={onDelete}
    >
      <div
        onClick={handleSignature}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: customData.signed ? "#e8f5e8" : "transparent",
          color: customData.signed ? "#28a745" : "#666",
          fontWeight: customData.signed ? "600" : "400",
          transition: "all 0.2s ease",
        }}
      >
        {customData.signed ? (
          <span>
            ✓ {customData.text}
          </span>
        ) : (
          <span>{customData.text}</span>
        )}
      </div>
    </WidgetOverlay>
  );
};

export default SignatureWidget;