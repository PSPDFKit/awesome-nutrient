import React, { useState, useRef, useEffect } from "react";
import TabBar from "./components/tab-bar.jsx";
import PdfViewerComponent from "./components/pdf-viewer-component.jsx";
import "./app.css";

function b64toBlob(b64Data, contentType = "application/pdf", sliceSize = 512) {
  const byteChars = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const bytes = Array.from(slice).map((c) => c.charCodeAt(0));
    byteArrays.push(new Uint8Array(bytes));
  }
  return new Blob(byteArrays, { type: contentType });
}

export default function App() {
  const fileInputRef = useRef();
  const viewerRefs = useRef({});
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  useEffect(() => {
    const storedIds = Object.keys(localStorage)
      .filter((k) => k.startsWith("pdf-") && !k.startsWith("pdf-meta-"))
      .map((k) => k.replace("pdf-", ""));

    if (storedIds.length === 0) return;

    const restored = storedIds.map((id) => {
      const base64 = localStorage.getItem(`pdf-${id}`);
      const metaRaw = localStorage.getItem(`pdf-meta-${id}`) || "{}";
      const meta = JSON.parse(metaRaw);
      const blob = b64toBlob(base64);
      const url = URL.createObjectURL(blob);

      return {
        id,
        title: meta.title || `Document ${id}`,
        url,
      };
    });

    setTabs(restored);
    if (restored.length > 0) {
      setActiveTabId(restored[0].id);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const id = Date.now().toString();
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1];
      localStorage.setItem(`pdf-${id}`, base64);
      localStorage.setItem(
        `pdf-meta-${id}`,
        JSON.stringify({ title: file.name }),
      );
    };
    reader.readAsDataURL(file);

    const url = URL.createObjectURL(file);
    const newTab = {
      id,
      title: file.name,
      url,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    e.target.value = "";
  };

  const closeTab = async (id) => {
    const shouldSave = window.confirm(
      "Do you want to save your changes before closing? Any unsaved edits will be lost.",
    );

    if (shouldSave) {
      const ref = viewerRefs.current[id];
      if (ref?.exportPdf) {
        try {
          const b64 = await ref.exportPdf();
          const blob = b64toBlob(b64);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          const tabTitle = tabs.find((t) => t.id === id)?.title || id;
          a.download = `${tabTitle}.pdf`;
          a.href = url;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("Failed to export PDF for download:", e);
        }
      }
    }

    localStorage.removeItem(`pdf-${id}`);
    localStorage.removeItem(`pdf-meta-${id}`);
    delete viewerRefs.current[id];

    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== id);
      if (activeTabId === id && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  };

  const openNewTab = () => {
    fileInputRef.current?.click();
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="app">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabClose={closeTab}
        onNewTab={openNewTab}
      />

      <div className="viewer-container">
        {tabs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>No documents open</h2>
              <p>Click the + button to open a PDF document</p>
              <button
                type="button"
                className="open-document-btn"
                onClick={openNewTab}
              >
                Open Document
              </button>
            </div>
          </div>
        ) : (
          <div className="tab-content-wrapper">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab-content ${tab.id === activeTabId ? "active" : ""}`}
              >
                <PdfViewerComponent
                  ref={(el) => {
                    if (el) viewerRefs.current[tab.id] = el;
                  }}
                  id={tab.id}
                  document={tab.url}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        style={{ display: "none" }}
      />
    </div>
  );
}
