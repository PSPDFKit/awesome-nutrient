import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import "./App.css";
import CommentThread from "./CommentThread";

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let cleanup = () => {};

    (async () => {
      const NutrientViewer = await import("@nutrient-sdk/viewer");

      // Ensure there’s only one `NutrientViewer` instance.
      NutrientViewer.unload(container);

      const baseUrl = `${window.location.protocol}//${window.location.host}/${
        import.meta.env.PUBLIC_URL ?? ""
      }`;

      if (container && NutrientViewer) {
        NutrientViewer.load({
          container,
          document: "https://www.nutrient.io/downloads/nutrient-web-demo.pdf",
          baseUrl,
          styleSheets: [`${baseUrl}comment-thread.css`],
          ui: {
            commentThread: (instance, id) => {
              const container = document.createElement("div");
              const root = createRoot(container);

              return {
                render: () => container,
                onMount: () => {
                  root.render(<CommentThread instance={instance} id={id} />);
                },
                onUnmount: () => {
                  root.unmount();
                },
              };
            },
          },
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
