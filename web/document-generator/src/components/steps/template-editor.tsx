"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { STEP_TITLES } from "@/lib/constants";
import { fetchTemplateJson } from "@/lib/utils";
import type { AppState } from "@/types";

interface TemplateEditorProps {
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  navigateToStep: (step: "template-selection" | "data-editor") => Promise<void>;
}

export default function TemplateEditor({
  appState,
  updateAppState,
  navigateToStep,
}: TemplateEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const isInitializing = useRef(false);

  const initializeEditor = useCallback(async () => {
    console.log(
      "🔄 TemplateEditor: Initializing for template:",
      appState.template,
    );

    if (isInitializing.current) {
      console.log("⏸️ Initialization already in progress, skipping");
      return;
    }

    // Wait for ref to be available with timeout
    let attempts = 0;
    const maxAttempts = 20;
    while (!editorRef.current && attempts < maxAttempts) {
      console.log(
        `🔄 Waiting for editor ref (attempt ${attempts + 1}/${maxAttempts})...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!editorRef.current) {
      console.warn("❌ No editor ref available after waiting");
      return;
    }

    // Additional validation: ensure the element is properly attached to DOM
    if (!editorRef.current.isConnected) {
      console.warn("❌ Editor ref element is not connected to DOM");
      return;
    }

    // Ensure the element has proper dimensions
    const rect = editorRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn("❌ Editor ref element has zero dimensions:", rect);
      // Wait a bit more for layout to complete
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newRect = editorRef.current.getBoundingClientRect();
      if (newRect.width === 0 || newRect.height === 0) {
        console.warn(
          "❌ Editor ref element still has zero dimensions after waiting:",
          newRect,
        );
        return;
      }
    }

    if (!appState.template) {
      console.warn("❌ No template selected");
      return;
    }

    isInitializing.current = true;
    setIsLoading(true);
    try {
      // Initialize Document Authoring system if not already done
      let docAuthSystem = appState.docAuthSystem;
      if (!docAuthSystem) {
        if (!window.DocAuth) {
          console.error("❌ Document Authoring SDK not loaded");
          throw new Error("Document Authoring SDK not loaded");
        }

        docAuthSystem = await window.DocAuth.createDocAuthSystem();
        console.log("✅ Document Authoring system created");
        updateAppState({ docAuthSystem });
      }

      // Prepare the template document
      let templateDocument = appState.templateDocument;
      if (!templateDocument) {
        console.log("📄 Loading template document for:", appState.template);

        if (appState.template === "custom" && appState.customTemplateBinary) {
          templateDocument = await docAuthSystem.importDOCX(
            appState.customTemplateBinary,
          );
          console.log("✅ Custom DOCX template imported");
        } else {
          try {
            const templateJson = await fetchTemplateJson(appState.template);
            templateDocument = await docAuthSystem.loadDocument(templateJson);
            console.log("✅ DocJSON template loaded");
          } catch (fetchError) {
            console.error("❌ Error fetching template JSON:", fetchError);
            throw fetchError;
          }
        }

        updateAppState({ templateDocument });
      }

      // Initialize editor
      console.log("🖊️ Creating template editor...");

      // Clear any existing content in the container
      const container = editorRef.current;
      if (!container) {
        console.warn(
          "❌ Container became null during template editor initialization",
        );
        return;
      }

      while (container.firstChild) {
        const child = container.firstChild;
        if (child.parentNode === container) {
          container.removeChild(child);
        } else {
          // If parent relationship is broken, break the loop to prevent infinite loop
          break;
        }
      }

      // Ensure container is properly styled and stable for the SDK
      if (!container.id) {
        container.id = `template-editor-${Date.now()}`;
      }
      container.style.position = "relative";
      container.style.overflow = "hidden";

      // Wait a frame to ensure DOM is completely settled
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Final validation before SDK call
      if (!container.isConnected || !container.parentElement) {
        console.warn(
          "❌ Template container became disconnected before editor creation",
        );
        return;
      }

      console.log("📝 Container cleared, creating editor with dimensions:", {
        width: container.getBoundingClientRect().width,
        height: container.getBoundingClientRect().height,
      });

      try {
        const editor = await docAuthSystem.createEditor(container, {
          document: templateDocument,
        });
        console.log("✅ Template editor ready");
        updateAppState({ templateEditor: editor });
      } catch (sdkError) {
        console.error(
          "❌ Document Authoring SDK error in template editor:",
          sdkError,
        );
        // Try to recover by retrying after a short delay
        console.log("🔄 Retrying template SDK initialization after delay...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Re-validate container is still available
        if (container.isConnected && container.parentElement) {
          try {
            const editor = await docAuthSystem.createEditor(container, {
              document: templateDocument,
            });
            console.log(
              "✅ Template editor created successfully on retry:",
              editor,
            );
            updateAppState({ templateEditor: editor });
          } catch (retryError) {
            console.error(
              "❌ Template Document Authoring SDK retry failed:",
              retryError,
            );
            throw retryError;
          }
        } else {
          console.error("❌ Template container no longer available for retry");
          throw sdkError;
        }
      }
    } catch (error) {
      console.error("❌ Error initializing template editor:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        appState: {
          template: appState.template,
          hasDocAuthSystem: !!appState.docAuthSystem,
          hasTemplateDocument: !!appState.templateDocument,
        },
      });
    } finally {
      setIsLoading(false);
      isInitializing.current = false;
    }
  }, [appState, updateAppState]);

  useEffect(() => {
    // Only initialize if we have a template and don't already have an editor
    if (
      appState.template &&
      !appState.templateEditor &&
      !isInitializing.current
    ) {
      initializeEditor();
    }

    // Cleanup function
    return () => {
      if (appState.templateEditor) {
        appState.templateEditor.destroy();
        updateAppState({ templateEditor: null });
      }
    };
  }, [
    appState.template,
    appState.templateEditor,
    initializeEditor,
    updateAppState,
  ]);

  const handleBackToSelection = useCallback(async () => {
    if (appState.templateEditor) {
      appState.templateEditor.destroy();
    }
    updateAppState({
      templateEditor: null,
      templateDocument: null,
    });
    await navigateToStep("template-selection");
  }, [appState.templateEditor, updateAppState, navigateToStep]);

  const handleProceedToData = useCallback(async () => {
    await navigateToStep("data-editor");
  }, [navigateToStep]);

  return (
    <div className="nutri-card flex flex-col h-screen">
      <div className="nutri-card-header flex-shrink-0">
        <h2 className="text-2xl font-bold">{STEP_TITLES["template-editor"]}</h2>
      </div>

      <div className="nutri-card-content flex-1 min-h-0 p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutrient-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Loading template editor...</p>
            </div>
          </div>
        )}
        <div
          ref={editorRef}
          className="nutri-editor h-full m-6"
          style={{ minHeight: "500px", width: "100%" }}
        />
      </div>

      <div className="nutri-card-footer flex-shrink-0 relative z-10">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBackToSelection}
            className="nutri-button-secondary"
            disabled={isLoading}
          >
            ← Select Template
          </button>
          <button
            type="button"
            onClick={handleProceedToData}
            className="nutri-button-primary"
            disabled={isLoading}
          >
            Prepare JSON Data →
          </button>
        </div>
      </div>
    </div>
  );
}
