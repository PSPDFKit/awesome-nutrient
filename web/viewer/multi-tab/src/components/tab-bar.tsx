interface Tab {
  id: string;
  title: string;
  url: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}: TabBarProps) {
  const handleTabClick = (tabId: string) => {
    onTabSelect(tabId);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTabSelect(tabId);
    }
  };

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? "active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
            role="tab"
            tabIndex={0}
            aria-selected={tab.id === activeTabId}
          >
            <span className="tab-icon">📄</span>
            <span className="tab-title">{tab.title}</span>
            <button
              type="button"
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close tab"
              aria-label={`Close ${tab.title}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="new-tab-btn"
          onClick={onNewTab}
          title="Open document"
          aria-label="Open new document"
        >
          +
        </button>
      </div>
    </div>
  );
}

