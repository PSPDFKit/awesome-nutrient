// src/components/debug-panel.jsx
import { useEffect, useRef, useState } from "react";
import mixpanelService from "../services/mixpanel.js";

export default function DebugPanel() {
  const [events, setEvents] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [sdkEventStats, setSdkEventStats] = useState({});
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const allEvents = mixpanelService.getTrackedEvents();
      setEvents([...allEvents]);

      const sdkEvents = allEvents.filter(
        (e) => e.properties.event_source === "nutrient_sdk",
      );
      const stats = sdkEvents.reduce((acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      }, {});
      setSdkEventStats(stats);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const testNutrientConnection = () => {
    if (window.NutrientViewer) {
      mixpanelService.track("Nutrient SDK Test", {
        sdk_available: true,
        sdk_version: window.NutrientViewer.version || "unknown",
        test_timestamp: Date.now(),
        event_source: "manual_test",
      });
    } else {
      mixpanelService.track("Nutrient SDK Test", {
        sdk_available: false,
        test_timestamp: Date.now(),
        event_source: "manual_test",
      });
    }
  };

  const clearEvents = () => {
    mixpanelService.clearEventQueue();
    setEvents([]);
    setSdkEventStats({});
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleVisibility();
    }
  };

  if (!import.meta.env.DEV) return null;

  const sdkEventCount = events.filter(
    (e) => e.properties.event_source === "nutrient_sdk",
  ).length;
  const totalEvents = events.length;

  return (
    <>
      <button
        type="button"
        className="debug-toggle"
        onClick={toggleVisibility}
        onKeyDown={handleKeyDown}
        aria-label="Toggle debug panel"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "25px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
          zIndex: 10000,
        }}
      >
        SDK Events: {sdkEventCount}/{totalEvents}
      </button>

      {isVisible && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3>Nutrient SDK Events Debug</h3>
            <div className="debug-actions">
              <button
                type="button"
                onClick={testNutrientConnection}
                className="test-btn"
              >
                Test SDK
              </button>
              <button type="button" onClick={clearEvents} className="clear-btn">
                Clear Events
              </button>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>

          <div className="debug-content">
            <div className="debug-section">
              <h4>SDK Event Statistics</h4>
              <div className="sdk-stats">
                <div className="stat-item">
                  <strong>Total SDK Events:</strong> {sdkEventCount}
                </div>
                <div className="stat-item">
                  <strong>Total All Events:</strong> {totalEvents}
                </div>
                <div className="stat-breakdown">
                  <h5>Event Breakdown:</h5>
                  {Object.entries(sdkEventStats).map(([eventName, count]) => (
                    <div key={eventName} className="event-stat">
                      <span>{eventName}:</span> <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="debug-section">
              <h4>Recent SDK Events (Last 10)</h4>
              <div className="events-list">
                {events
                  .filter((e) => e.properties.event_source === "nutrient_sdk")
                  .slice(-10)
                  .reverse()
                  .map((event) => (
                    <div
                      key={`${event.timestamp.getTime()}-${
                        event.event
                      }-${Math.random()}`}
                      className="event-item sdk-event"
                    >
                      <div className="event-header">
                        <strong>{event.event}</strong>
                        <span className="event-time">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="event-properties">
                        <div className="key-properties">
                          {event.properties.page_number && (
                            <span className="property-tag">
                              Page {event.properties.page_number}
                            </span>
                          )}
                          {event.properties.annotation_type && (
                            <span className="property-tag">
                              {event.properties.annotation_type}
                            </span>
                          )}
                          {event.properties.zoom_level && (
                            <span className="property-tag">
                              {event.properties.zoom_level}%
                            </span>
                          )}
                        </div>
                        <details>
                          <summary>Full Details</summary>
                          <pre>{JSON.stringify(event.properties, null, 2)}</pre>
                        </details>
                      </div>
                    </div>
                  ))}

                {sdkEventCount === 0 && (
                  <>
                    <p>No SDK events detected yet. Try:</p>
                    <ul>
                      <li>Navigate between pages</li>
                      <li>Zoom in/out</li>
                      <li>Create annotations</li>
                      <li>Select text</li>
                      <li>Toggle sidebar</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
