// src/components/pdf-viewer-component.tsx

import type { Instance, ViewState } from "@nutrient-sdk/viewer";
import { useCallback, useEffect, useRef, useState } from "react";
import mixpanelService from "../services/mixpanel.ts";

interface PdfViewerComponentProps {
  document: string;
  fileName: string;
  onViewerReady?: () => void;
}

interface DocumentInfo {
  file_name: string;
  session_id: string;
  total_pages?: number | string;
  initial_page?: number;
  initial_zoom?: number;
  initial_annotation_count?: number;
}

export default function PdfViewerComponent({
  document,
  fileName,
  onViewerReady,
}: PdfViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewerInstance, setViewerInstance] = useState<Instance | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const startTimeRef = useRef(Date.now());
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );

  // Memoize functions to avoid dependency issues
  const getDocumentInfoFromNutrient = useCallback(
    async (
      instance: Instance,
      currentFileName: string,
    ): Promise<DocumentInfo> => {
      try {
        const info: DocumentInfo = {
          file_name: currentFileName,
          session_id: sessionId.current,
        };

        if (instance.totalPageCount !== undefined) {
          info.total_pages = instance.totalPageCount;
        }

        if (instance.viewState) {
          if (instance.viewState.currentPageIndex !== undefined) {
            info.initial_page = instance.viewState.currentPageIndex + 1;
          }
          if (
            instance.viewState.zoom !== undefined &&
            !Number.isNaN(instance.viewState.zoom)
          ) {
            info.initial_zoom = Math.round(
              Number(instance.viewState.zoom) * 100,
            );
          }
        }

        try {
          const annotations = await instance.getAnnotations(0);
          info.initial_annotation_count = annotations.size;
        } catch (_e) {
          // Error getting annotations - set to 0
          info.initial_annotation_count = 0;
        }

        return info;
      } catch (error) {
        console.error("Error getting document info:", error);
        return {
          file_name: currentFileName,
          session_id: sessionId.current,
          total_pages: "unknown",
        };
      }
    },
    [],
  );

  const setupNutrientSDKEvents = useCallback(
    (instance: Instance, docInfo: DocumentInfo) => {
      const baseEventData = {
        ...docInfo,
      };

      try {
        // Page navigation
        instance.addEventListener(
          "viewState.currentPageIndex.change",
          (pageIndex: number) => {
            mixpanelService.track("Page Navigation", {
              ...baseEventData,
              page_number: pageIndex + 1,
              event_source: "nutrient_sdk",
            });
          },
        );

        // Zoom changes
        instance.addEventListener(
          "viewState.zoom.change",
          (zoomLevel: number) => {
            mixpanelService.track("Zoom Change", {
              ...baseEventData,
              zoom_level: Math.round(zoomLevel * 100),
              zoom_factor: zoomLevel,
              event_source: "nutrient_sdk",
            });
          },
        );

        // View state changes
        instance.addEventListener(
          "viewState.change",
          (viewState: ViewState) => {
            mixpanelService.track("View State Change", {
              ...baseEventData,
              view_state_keys: Object.keys(viewState),
              event_source: "nutrient_sdk",
            });
          },
        );

        // Annotation creation
        instance.addEventListener(
          "annotations.create",
          (createdAnnotations) => {
            const annotations = createdAnnotations.toArray();

            annotations.forEach((annotation) => {
              const className =
                "className" in annotation &&
                typeof annotation.className === "string"
                  ? annotation.className
                  : null;
              const hasNote = !!("note" in annotation && annotation.note);
              const hasContents = !!(
                "contents" in annotation && annotation.contents
              );

              mixpanelService.track("Annotation Created", {
                ...baseEventData,
                annotation_type: className || annotation.constructor.name,
                annotation_id: annotation.id,
                page_number: annotation.pageIndex + 1,
                has_content: hasNote || hasContents,
                event_source: "nutrient_sdk",
              });
            });
          },
        );

        // Annotation updates
        instance.addEventListener(
          "annotations.update",
          (updatedAnnotations) => {
            const annotations = updatedAnnotations.toArray();

            annotations.forEach((annotation) => {
              const className =
                "className" in annotation &&
                typeof annotation.className === "string"
                  ? annotation.className
                  : null;

              mixpanelService.track("Annotation Updated", {
                ...baseEventData,
                annotation_type: className || annotation.constructor.name,
                annotation_id: annotation.id,
                page_number: annotation.pageIndex + 1,
                event_source: "nutrient_sdk",
              });
            });
          },
        );

        // Annotation deletion
        instance.addEventListener(
          "annotations.delete",
          (deletedAnnotations) => {
            const annotations = deletedAnnotations.toArray();

            annotations.forEach((annotation) => {
              const className =
                "className" in annotation &&
                typeof annotation.className === "string"
                  ? annotation.className
                  : null;

              mixpanelService.track("Annotation Deleted", {
                ...baseEventData,
                annotation_type: className || annotation.constructor.name,
                annotation_id: annotation.id,
                page_number: annotation.pageIndex + 1,
                event_source: "nutrient_sdk",
              });
            });
          },
        );

        // Annotation selection
        instance.addEventListener("annotationSelection.change", (selection) => {
          mixpanelService.track("Annotation Selection Changed", {
            ...baseEventData,
            selection_count: selection ? selection.size : 0,
            event_source: "nutrient_sdk",
          });
        });

        // Annotation interactions
        instance.addEventListener("annotations.press", (event) => {
          const annotation = event.annotation;
          const className =
            "className" in annotation &&
            typeof annotation.className === "string"
              ? annotation.className
              : null;

          mixpanelService.track("Annotation Pressed", {
            ...baseEventData,
            annotation_type: className || annotation.constructor.name,
            annotation_id: annotation.id,
            page_number: annotation.pageIndex + 1,
            event_source: "nutrient_sdk",
          });
        });

        // Text selection
        instance.addEventListener("textSelection.change", (selection) => {
          if (
            selection &&
            "text" in selection &&
            typeof selection.text === "string" &&
            selection.text.trim().length > 0
          ) {
            const pageIndex =
              "pageIndex" in selection &&
              typeof selection.pageIndex === "number"
                ? selection.pageIndex
                : 0;

            mixpanelService.track("Text Selection", {
              ...baseEventData,
              text_length: selection.text.length,
              page_number: pageIndex + 1,
              event_source: "nutrient_sdk",
            });
          } else if (selection === null) {
            mixpanelService.track("Text Selection Cleared", {
              ...baseEventData,
              event_source: "nutrient_sdk",
            });
          }
        });

        // Form field updates
        instance.addEventListener(
          "formFieldValues.update",
          (formFieldValues: Record<string, unknown>) => {
            mixpanelService.track("Form Field Updated", {
              ...baseEventData,
              field_count: Object.keys(formFieldValues).length,
              event_source: "nutrient_sdk",
            });
          },
        );

        // Form fields changes
        instance.addEventListener("formFields.change", () => {
          mixpanelService.track("Form Fields Changed", {
            ...baseEventData,
            event_source: "nutrient_sdk",
          });
        });

        // Search state changes
        instance.addEventListener("search.stateChange", (searchState) => {
          if (
            "query" in searchState &&
            typeof searchState.query === "string" &&
            searchState.query.trim()
          ) {
            const resultsCount =
              "results" in searchState &&
              searchState.results &&
              typeof searchState.results === "object" &&
              "size" in searchState.results &&
              typeof searchState.results.size === "number"
                ? searchState.results.size
                : 0;
            const isCaseSensitive =
              "isCaseSensitive" in searchState &&
              typeof searchState.isCaseSensitive === "boolean"
                ? searchState.isCaseSensitive
                : false;
            const isWholeWord =
              "matchWholeWord" in searchState &&
              typeof searchState.matchWholeWord === "boolean"
                ? searchState.matchWholeWord
                : false;

            mixpanelService.track("Search Performed", {
              ...baseEventData,
              query_length: searchState.query.length,
              results_count: resultsCount,
              is_case_sensitive: isCaseSensitive,
              is_whole_word: isWholeWord,
              event_source: "nutrient_sdk",
            });
          }
        });

        // Search term changes
        instance.addEventListener("search.termChange", (event) => {
          const searchTerm =
            "searchTerm" in event && typeof event.searchTerm === "string"
              ? event.searchTerm
              : null;
          mixpanelService.track("Search Term Changed", {
            ...baseEventData,
            search_term_length: searchTerm ? searchTerm.length : 0,
            event_source: "nutrient_sdk",
          });
        });

        // Document changes
        instance.addEventListener("document.change", (operations) => {
          mixpanelService.track("Document Modified", {
            ...baseEventData,
            operation_count: operations.length,
            event_source: "nutrient_sdk",
          });
        });

        // Document save state changes
        instance.addEventListener(
          "document.saveStateChange",
          (saveState: { hasUnsavedChanges?: boolean }) => {
            mixpanelService.track("Document Save State Changed", {
              ...baseEventData,
              has_changes: saveState.hasUnsavedChanges,
              event_source: "nutrient_sdk",
            });
          },
        );

        // Page interactions
        instance.addEventListener(
          "page.press",
          (pageInfo: { pageIndex: number }) => {
            mixpanelService.track("Page Pressed", {
              ...baseEventData,
              page_number: pageInfo.pageIndex + 1,
              event_source: "nutrient_sdk",
            });
          },
        );

        // Bookmark changes
        instance.addEventListener("bookmarks.change", () => {
          mixpanelService.track("Bookmarks Changed", {
            ...baseEventData,
            event_source: "nutrient_sdk",
          });
        });

        // Comments changes
        instance.addEventListener("comments.change", () => {
          mixpanelService.track("Comments Changed", {
            ...baseEventData,
            event_source: "nutrient_sdk",
          });
        });

        // Undo actions
        instance.addEventListener("history.undo", () => {
          mixpanelService.track("Undo Action", {
            ...baseEventData,
            event_source: "nutrient_sdk",
          });
        });

        // Redo actions
        instance.addEventListener("history.redo", () => {
          mixpanelService.track("Redo Action", {
            ...baseEventData,
            event_source: "nutrient_sdk",
          });
        });

        // Ink signature creation
        instance.addEventListener(
          "inkSignatures.create",
          (signature: { id: string }) => {
            mixpanelService.track("Ink Signature Created", {
              ...baseEventData,
              signature_id: signature.id,
              event_source: "nutrient_sdk",
            });
          },
        );

        console.log("Nutrient SDK event listeners registered successfully");
      } catch (error) {
        console.error("Error setting up Nutrient SDK events:", error);
        mixpanelService.track("Event Setup Error", {
          ...baseEventData,
          error_message: (error as Error).message,
          event_source: "setup_error",
        });
      }
    },
    [],
  );

  // Main effect for loading PDF viewer
  useEffect(() => {
    const container = containerRef.current;
    const { NutrientViewer } = window;

    if (container && NutrientViewer) {
      const loadStartTime = Date.now();

      NutrientViewer.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: document,
        toolbarItems: [
          ...NutrientViewer.defaultToolbarItems,
          { type: "content-editor" },
        ],
      })
        .then(async (instance) => {
          const loadTime = Date.now() - loadStartTime;

          setViewerInstance(instance);

          const docInfo = await getDocumentInfoFromNutrient(instance, fileName);
          setDocumentInfo(docInfo);

          if (onViewerReady) {
            onViewerReady();
          }

          mixpanelService.track("PDF Viewer Loaded", {
            load_time_ms: loadTime,
            ...docInfo,
          });

          setupNutrientSDKEvents(instance, docInfo);
        })
        .catch((error: Error) => {
          console.error("PDF Viewer Load Error:", error);
          mixpanelService.track("PDF Viewer Load Error", {
            error_message: error.message,
            file_name: fileName,
            session_id: sessionId.current,
          });
        });
    }

    return () => {
      const { NutrientViewer } = window;
      NutrientViewer?.unload(container);
    };
  }, [
    document,
    fileName,
    onViewerReady,
    getDocumentInfoFromNutrient,
    setupNutrientSDKEvents,
  ]);

  // Separate effect for session cleanup
  useEffect(() => {
    return () => {
      if (viewerInstance && documentInfo) {
        const sessionDuration = (Date.now() - startTimeRef.current) / 1000;
        mixpanelService.track("PDF Session End", {
          session_duration_seconds: sessionDuration,
          ...documentInfo,
        });
      }
    };
  }, [viewerInstance, documentInfo]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
