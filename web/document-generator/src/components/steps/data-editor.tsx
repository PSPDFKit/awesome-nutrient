"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { STEP_TITLES } from "@/lib/constants";
import { fetchTemplateData, validateJsonString } from "@/lib/utils";
import type { AppState } from "@/types";

interface DataEditorProps {
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  navigateToStep: (step: "template-editor" | "docx-editor") => Promise<void>;
}

export default function DataEditor({
  appState,
  updateAppState,
  navigateToStep,
}: DataEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  const initializeDataEditor = useCallback(async () => {
    console.log("🔄 DataEditor: initializeDataEditor called");
    console.log("📋 Current state:", {
      hasEditorRef: !!editorContainerRef.current,
      template: appState.template,
      hasDataJson: !!appState.dataJson,
      hasDataEditor: !!appState.dataEditor,
      windowCodeMirror: !!window.CodeMirror,
    });

    // Wait for ref to be available with timeout
    let attempts = 0;
    const maxAttempts = 20;
    while (!editorContainerRef.current && attempts < maxAttempts) {
      console.log(
        `🔄 Waiting for editor container ref (attempt ${attempts + 1}/${maxAttempts})...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!editorContainerRef.current) {
      console.warn("❌ No editor container ref available after waiting");
      return;
    }

    // Additional validation: ensure the element is properly attached to DOM
    if (!editorContainerRef.current.isConnected) {
      console.warn("❌ Editor container ref element is not connected to DOM");
      return;
    }

    // Ensure the element has proper dimensions
    const rect = editorContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn(
        "❌ Editor container ref element has zero dimensions:",
        rect,
      );
      // Wait a bit more for layout to complete
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newRect = editorContainerRef.current.getBoundingClientRect();
      if (newRect.width === 0 || newRect.height === 0) {
        console.warn(
          "❌ Editor container ref element still has zero dimensions after waiting:",
          newRect,
        );
        return;
      }
    }

    if (!appState.template) {
      console.warn("❌ No template selected");
      return;
    }

    setIsLoading(true);
    try {
      // Get the template JSON data
      let dataJson = appState.dataJson;
      if (!dataJson) {
        console.log("📄 Fetching template data for:", appState.template);
        try {
          dataJson = await fetchTemplateData(appState.template);
          console.log("✅ Template data fetched:", dataJson);
          updateAppState({ dataJson });
        } catch (fetchError) {
          console.error("❌ Error fetching template data:", fetchError);
          throw fetchError;
        }
      } else {
        console.log("✅ Template data already exists");
      }

      // Create textarea and initialize CodeMirror
      if (!window.CodeMirror) {
        console.error("❌ CodeMirror not available - may not be loaded");
        throw new Error("CodeMirror not loaded");
      }

      if (dataJson) {
        console.log("🖊️ Creating CodeMirror editor...");
        console.log("Editor container:", editorContainerRef.current);

        const textarea = document.createElement("textarea");
        textarea.value = JSON.stringify(dataJson, null, 2);
        console.log(
          "📝 JSON data to edit:",
          `${JSON.stringify(dataJson, null, 2).substring(0, 200)}...`,
        );

        // Clear container and add textarea safely
        const container = editorContainerRef.current;

        // Only clear if there's no active CodeMirror editor
        if (!appState.dataEditor) {
          while (container.firstChild) {
            const child = container.firstChild;
            if (child.parentNode === container) {
              container.removeChild(child);
            } else {
              // If parent relationship is broken, break the loop to prevent infinite loop
              break;
            }
          }
        }

        container.appendChild(textarea);
        console.log("📝 Textarea added to container, dimensions:", {
          width: container.getBoundingClientRect().width,
          height: container.getBoundingClientRect().height,
        });

        // Initialize CodeMirror
        const editor = window.CodeMirror.fromTextArea(textarea, {
          mode: { name: "javascript", json: true },
          theme: "default",
          tabSize: 2,
          lineNumbers: true,
          lineWrapping: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        });
        console.log("✅ CodeMirror editor created:", editor);

        // Validate JSON on change
        editor.on("change", (instance: any) => {
          const value = instance.getValue();
          if (validateJsonString(value)) {
            setJsonError(null);
          } else {
            setJsonError("Invalid JSON format");
          }
        });

        updateAppState({ dataEditor: editor });
        console.log("✅ Data editor ready");
      } else {
        console.warn("❌ Cannot create editor - no data JSON available");
      }
    } catch (error) {
      console.error("❌ Error initializing data editor:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        appState: {
          template: appState.template,
          hasDataJson: !!appState.dataJson,
          hasDataEditor: !!appState.dataEditor,
        },
      });
    } finally {
      setIsLoading(false);
      console.log("🏁 DataEditor initialization finished");
    }
  }, [
    appState.template,
    appState.dataJson,
    appState.dataEditor,
    updateAppState,
  ]);

  useEffect(() => {
    console.log("🔄 DataEditor useEffect mounted");
    // Only initialize if we have a template and don't already have an editor
    if (appState.template && !appState.dataEditor) {
      initializeDataEditor();
    }

    // Cleanup function
    return () => {
      console.log("🧹 DataEditor cleanup called");
      if (appState.dataEditor) {
        console.log("🗑️ Destroying existing data editor");
        try {
          appState.dataEditor.toTextArea();
        } catch (error) {
          console.warn(
            "⚠️ CodeMirror cleanup failed (likely due to missing DOM elements):",
            error,
          );
          // Continue with cleanup even if toTextArea fails
        }
        updateAppState({ dataEditor: null });
      }
    };
  }, [
    appState.template,
    appState.dataEditor,
    initializeDataEditor,
    updateAppState,
  ]);

  const handleBackToTemplate = useCallback(async () => {
    console.log("⬅️ Navigating back to template editor");
    if (appState.dataEditor) {
      console.log("🗑️ Destroying data editor before navigation");
      try {
        appState.dataEditor.toTextArea();
      } catch (error) {
        console.warn("⚠️ CodeMirror cleanup failed during navigation:", error);
      }
    }
    updateAppState({
      dataEditor: null,
      dataJson: null,
    });
    await navigateToStep("template-editor");
  }, [appState.dataEditor, updateAppState, navigateToStep]);

  const handleProceedToDocx = useCallback(async () => {
    console.log("➡️ Proceeding to DOCX editor");
    if (!appState.dataEditor) {
      console.warn("❌ No data editor available");
      return;
    }

    try {
      const jsonString = appState.dataEditor.getValue();
      console.log("📝 Current JSON string length:", jsonString.length);

      if (!validateJsonString(jsonString)) {
        console.warn("❌ JSON validation failed");
        setJsonError("Please fix JSON errors before proceeding");
        return;
      }

      const dataJson = JSON.parse(jsonString);
      console.log("✅ JSON parsed successfully:", dataJson);
      updateAppState({ dataJson });

      await navigateToStep("docx-editor");
    } catch (error) {
      console.error("❌ Error processing JSON:", error);
      setJsonError("Failed to parse JSON data");
    }
  }, [appState.dataEditor, updateAppState, navigateToStep]);

  console.log("🎨 DataEditor rendering with state:", {
    isLoading,
    template: appState.template,
    hasDataJson: !!appState.dataJson,
    hasDataEditor: !!appState.dataEditor,
    jsonError,
  });

  return (
    <div className="nutri-card flex flex-col h-screen">
      <div className="nutri-card-header flex-shrink-0">
        <h2 className="text-2xl font-bold">{STEP_TITLES["data-editor"]}</h2>
      </div>

      <div className="nutri-card-content flex-1 min-h-0 flex flex-col p-6 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutrient-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Loading data editor...</p>
            </div>
          </div>
        )}
        {jsonError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex-shrink-0">
            <p className="text-red-700 text-sm">{jsonError}</p>
          </div>
        )}
        <div
          ref={editorContainerRef}
          className="w-full flex-1 min-h-0"
          style={{ minHeight: "300px" }}
        />
      </div>

      <div className="nutri-card-footer flex-shrink-0 relative z-10">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBackToTemplate}
            className="nutri-button-secondary"
            disabled={isLoading}
          >
            ← Edit Template
          </button>
          <button
            type="button"
            onClick={handleProceedToDocx}
            className="nutri-button-primary"
            disabled={isLoading || !!jsonError}
          >
            Generate DOCX →
          </button>
        </div>
      </div>
    </div>
  );
}
