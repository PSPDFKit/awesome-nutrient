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
            viewState.set("sidebarWidth", 600),
          );

          function getDocumentEditorToolbarItem(isSelected: boolean) {
            return {
              type: "custom" as const,
              selected: isSelected,
              id: "documentEditorToolbarItem",
              title: "Document Editor",
              dropdownGroup: "sidebar",
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.02 5.97a.75.75 0 0 0 0 1.06l4.95 4.95a.75.75 0 0 0 1.06 0l4.95-4.95a.75.75 0 0 0 0-1.06l-4.95-4.95a.75.75 0 0 0-1.06 0zm5.48 4.42L13.61 6.5l3.89-3.89 3.889 3.89-3.89 3.89ZM3 2.25a.75.75 0 0 0-.75.75v7c0 .414.336.75.75.75h7a.75.75 0 0 0 .75-.75V3a.75.75 0 0 0-.75-.75zm.75 7v-5.5h5.5v5.5zM2.25 14a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75zm1.5.75v5.5h5.5v-5.5zM14 13.25a.75.75 0 0 0-.75.75v7c0 .414.336.75.75.75h7a.75.75 0 0 0 .75-.75v-7a.75.75 0 0 0-.75-.75zm.75 7v-5.5h5.5v5.5z" clip-rule="evenodd"></path></svg>',
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
          }

          // Add the custom toolbar item to the existing toolbar items.
          instance.setToolbarItems([
            ...NutrientViewer.defaultToolbarItems,
            getDocumentEditorToolbarItem(
              instance.viewState.sidebarMode === "documentEditor",
            ),
          ]);

          instance.addEventListener("viewState.change", (viewState) => {
            instance.setToolbarItems([
              ...NutrientViewer.defaultToolbarItems,
              getDocumentEditorToolbarItem(
                viewState.sidebarMode === "documentEditor",
              ),
            ]);
          });
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
