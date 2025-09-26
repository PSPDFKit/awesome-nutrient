import React, { useState } from "react";
import WidgetOverlay from "./WidgetOverlay";

export const DateWidget  = ({
  annotation,
  customData,
  boundingBox,
  onUpdate,
  onDelete,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    customData?.selectedDate || new Date().toISOString().split("T")[0]
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setIsOpen(false);

    if (onUpdate) {
      onUpdate({
        selectedDate: newDate,
        text: formatDisplayDate(newDate),
      });
    }
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <WidgetOverlay
      annotation={annotation}
      customData={customData}
      boundingBox={boundingBox}
      onUpdate={onUpdate}
      onDelete={onDelete}
      style={{
        backgroundColor: "#fff3cd",
        borderColor: "#ffc107",
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
          cursor: "pointer",
          pointerEvents: "auto",
        }}
        onClick={handleClick}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "14px" }}>📅</span>
          <span style={{ fontSize: "12px", fontWeight: "500" }}>
            {formatDisplayDate(selectedDate)}
          </span>
        </div>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 1000,
              backgroundColor: "white",
              border: "2px solid #ffc107",
              borderRadius: "4px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              padding: "8px",
              marginTop: "2px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{
                border: "1px solid #ddd",
                borderRadius: "2px",
                padding: "4px",
                fontSize: "12px",
                width: "140px",
              }}
              autoFocus
            />
          </div>
        )}
      </div>
    </WidgetOverlay>
  );
};

export default DateWidget;
