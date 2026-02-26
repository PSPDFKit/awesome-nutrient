"use client";

import type {
  DocAuthDocument,
  DocAuthEditor,
  DocAuthSystem,
} from "@nutrient-sdk/document-authoring";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DocumentRuntime } from "@/lib/document/runtime";

type EditorState = "idle" | "loading" | "ready" | "error";

type EditorInstanceState = {
  system: DocAuthSystem;
  editor: DocAuthEditor;
  document: DocAuthDocument;
};

type DocumentEditorSurfaceProps = {
  onReadyAction?: (runtime: DocumentRuntime) => void;
  onUnavailableAction?: () => void;
};

export function DocumentEditorSurface({
  onReadyAction: onReady,
  onUnavailableAction: onUnavailable,
}: DocumentEditorSurfaceProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<DocumentRuntime | null>(null);
  const editorStateRef = useRef<EditorInstanceState | null>(null);
  const [editorState, setEditorState] = useState<EditorState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const helperText = useMemo(() => {
    switch (editorState) {
      case "idle":
      case "loading":
        return "Loading document editor...";
      case "ready":
        return "Editor ready";
      case "error":
        return errorMessage ?? "Failed to initialize the document editor.";
      default:
        return "Loading document editor...";
    }
  }, [editorState, errorMessage]);

  useEffect(() => {
    let disposed = false;

    const init = async () => {
      if (!hostRef.current) {
        return;
      }

      setEditorState("loading");
      try {
        const imported = await import("@nutrient-sdk/document-authoring");
        const docAuthRoot = imported.default ?? imported;

        const system = await docAuthRoot.createDocAuthSystem();
        const initialDocument = await system.createDocumentFromPlaintext("");
        const editor = await system.createEditor(hostRef.current, {
          document: initialDocument,
        });

        if (disposed) {
          editor.destroy();
          system.destroy();
          return;
        }

        editorStateRef.current = {
          system,
          editor,
          document: initialDocument,
        };

        const transaction: DocumentRuntime["transaction"] = async (
          callback,
        ) => {
          const state = editorStateRef.current;
          if (!state) {
            throw new Error("Document runtime not initialized.");
          }

          return state.document.transaction(async ({ draft }) => {
            const result = await callback(draft);
            return { commit: true, result };
          });
        };

        runtimeRef.current = {
          hasActiveCursor: () => {
            const state = editorStateRef.current;
            if (!state) {
              return false;
            }
            return state.editor.hasActiveCursor();
          },
          transaction,
          saveSnapshot: async (): Promise<object> => {
            const state = editorStateRef.current;
            if (!state) {
              throw new Error("Document runtime not initialized.");
            }
            return state.document.saveDocument();
          },
          restoreSnapshot: async (snapshot: object) => {
            const state = editorStateRef.current;
            if (!state) {
              throw new Error("Document runtime not initialized.");
            }

            const nextDocument = await state.system.loadDocument(snapshot);
            state.editor.setCurrentDocument(nextDocument);
            state.document = nextDocument;
          },
        };

        onReady?.(runtimeRef.current);
        setEditorState("ready");
      } catch (error) {
        if (disposed) {
          return;
        }

        setEditorState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unknown editor initialization failure.",
        );
        onUnavailable?.();
      }
    };

    void init();

    return () => {
      disposed = true;
      const state = editorStateRef.current;
      editorStateRef.current = null;
      runtimeRef.current = null;
      onUnavailable?.();

      if (state) {
        state.editor.destroy();
        state.system.destroy();
      }
    };
  }, [onReady, onUnavailable]);

  return (
    <section aria-label="Document Editor" className="editor-panel">
      <header className="panel-heading">
        <h2>Document</h2>
        <p>{helperText}</p>
      </header>
      <div className="editor-host-wrap">
        <div
          ref={hostRef}
          className="editor-host"
          data-testid="document-editor-host"
        />
      </div>
    </section>
  );
}
