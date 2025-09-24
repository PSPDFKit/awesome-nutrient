import React, { useState } from "react";
import { useNutrientViewer } from "../hooks/useNutrientViewer";
import SignatureWidget from "../components/SignatureWidget";
import TextWidget from "../components/TextWidget";
import DateWidget from "../components/DateWidget";
import createSigningControlsSidebar from "../components/SigningControlsSidebar.js";

const App = () => {

  // Custom widget component that chooses the appropriate widget based on type
  const CustomWidgetComponent = (props) => {
    const { customData } = props;
    const type = customData?.type || "signature";

    switch (type) {
      case "text":
        return <TextWidget {...props} />;
      case "date":
        return <DateWidget {...props} />;
      case "signature":
      default:
        return <SignatureWidget {...props} />;
    }
  };

  const {
    containerRef,
    instance,
    isLoaded,
    selectedAnnotations,
    currentMode,
    isFormCreatorMode,
    activeOverlays,
    createWidget,
    toggleFormCreator,
  } = useNutrientViewer({
    document: "/document.pdf", // Using the sample PDF from public folder
    theme: "DARK",
    customWidgetComponent: CustomWidgetComponent,
    customSidebarComponent: createSigningControlsSidebar,
    enableFormCreator: true,
    onReady: (instance) => {
      console.log("NutrientViewer is ready!", instance);
    },
    styleSheets: ["/styles.css"]
  });

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* PDF Viewer Container - Sidebar is now integrated within NutrientViewer */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default App;
