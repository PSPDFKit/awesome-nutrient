import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import "./App.css";
import DocumentEditor from "./DocumentEditor";

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let cleanup = () => {};

    (async () => {
      const NutrientViewer = (await import("@nutrient-sdk/viewer")).default;

      // Ensure there’s only one `NutrientViewer` instance.
      NutrientViewer.unload(container);

      const baseUrl = `${window.location.protocol}//${window.location.host}/${
        import.meta.env.PUBLIC_URL ?? ""
      }`;

      if (container && NutrientViewer) {
        NutrientViewer.load({
          container,
          document: "https://www.nutrient.io/downloads/nutrient-web-demo.pdf",
          // useCDN loads assets (like WASM files) from Nutrient's CDN
          useCDN: true,
          styleSheets: [`${baseUrl}document-editor.css`],
          ui: {
            sidebar: {
              documentEditor: (instance) => {
                const container = document.createElement("div");
                const root = createRoot(container);

                return {
                  render: () => container,
                  onMount: () => {
                    if (instance) {
                      root.render(<DocumentEditor instance={instance} />);
                    }
                  },
                  onUnmount: () => {
                    root.unmount();
                  },
                };
              },
            },
          },
        }).then((instance) => {
instance.setViewState((viewState) =>
  viewState.set(
      "sidebarWidth",
      600
    ),
  );



          // Define a custom toolbar item.
          const documentEditorToolbarItem = {
            type: "custom" as const,
            id: "documentEditorToolbarItem",
            title: "Document Editor",
            dropdownGroup: "sidebar",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hotpink"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"></path></svg>',
            onPress: () => {
              instance.setViewState((viewState) =>
                viewState.set(
                  "sidebarMode",
                  viewState.sidebarMode === "documentEditor"
                    ? null
                    : "documentEditor",
                ),
              );
            },
          };

          // Add the custom toolbar item to the existing toolbar items.
          instance.setToolbarItems([
            ...NutrientViewer.defaultToolbarItems,
            documentEditorToolbarItem,
          ]);
        });
      }

      cleanup = () => {
        NutrientViewer.unload(container);
      };
    })();

    return cleanup;
  }, []);

  // Set the container height and width.
  return <div ref={containerRef} style={{ height: "100vh", width: "100vw" }} />;
}

export default App;
