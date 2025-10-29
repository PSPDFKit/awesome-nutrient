import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let cleanup = () => {};

    (async () => {
      const NutrientViewer = (await import("@nutrient-sdk/viewer")).default;

      // Ensure there’s only one `NutrientViewer` instance.
      NutrientViewer.unload(container);

      if (container && NutrientViewer) {
        NutrientViewer.load({
          container,
          // You can also specify a file in public directory, for example /nutrient-web-demo.pdf.
          document: "https://www.nutrient.io/downloads/nutrient-web-demo.pdf",
          // baseUrl: where SDK should load its assets from (copied by rollup-plugin-copy).
          baseUrl: `${window.location.protocol}//${window.location.host}/${
            import.meta.env.PUBLIC_URL ?? "" // Usually empty for Vite, but supports custom deployments.
          }`,
          ui: {
            commentThread: (instance, id) => {
              const container = document.createElement("div");

              return {
                render: () => container,
                onMount: () => {},
                onUnmount: () => {},
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
