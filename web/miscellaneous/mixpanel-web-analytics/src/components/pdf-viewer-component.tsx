// src/components/pdf-viewer-component.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import type { Instance, Annotation, ViewState } from "@nutrient-sdk/viewer";
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
  const [viewerInstance, setViewerInstance] =
    useState<Instance | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const startTimeRef = useRef(Date.now());
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Memoize functions to avoid dependency issues
  const getDocumentInfoFromNutrient = useCallback(
    async (
      instance: Instance,
      currentFileName: string
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
            info.initial_zoom = Math.round(instance.viewState.zoom * 100);
          }
        }

        try {
          const annotations = await instance.getAnnotations(0);
          info.initial_annotation_count = annotations.length;
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
    []
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
          }
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
          }
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
          }
        );

        // Annotation creation
        instance.addEventListener(
          "annotations.create",
          (
            createdAnnotations: InstanceType<
              typeof NutrientViewer.Immutable.List<Annotation>
            >
          ) => {
            const annotations = Array.from(createdAnnotations);

            annotations.forEach((annotation: Annotation) => {
              mixpanelService.track("Annotation Created", {
                ...baseEventData,
                annotation_type:
                  annotation.className || annotation.constructor.name,
                annotation_id: annotation.id,
                page_number: annotation.pageIndex + 1,
                has_content: !!(annotation.note || annotation.contents),
                event_source: "nutrient_sdk",
              });
            });
          }
        );

        // Annotation updates
        instance.addEventListener(
          "annotations.update",
          (
            updatedAnnotations: InstanceType<
              typeof NutrientViewer.Immutable.List<Annotation>
            >
          ) => {
            const annotations = Array.from(updatedAnnotations);

            annotations.forEach((annotation: Annotation) => {
              mixpanelService.track("Annotation Updated", {
                ...baseEventData,
                annotation_type:
                  annotation.className || annotation.constructor.name,
                annotation_id: annotation.id,
                page_number: annotation.pageIndex + 1,
                event_source: "nutrient_sdk",
              });
            });
          }
        );

        // Annotation deletion
        instance.addEventListener(
          "annotations.delete",
          (
            deletedAnnotations: InstanceType<
              typeof NutrientViewer.Immutable.List<Annotation>
            >
          ) => {
            const annotations = Array.from(deletedAnnotations);

            annotations.forEach((annotation: Annotation) => {
              mixpanelService.track("Annotation Deleted", {
                ...baseEventData,
                annotation_type:
                  annotation.className || annotation.constructor.name,
                annotation_id: annotation.id,
                page_number: annotation.pageIndex + 1,
                event_source: "nutrient_sdk",
              });
            });
          }
        );

        // Annotation selection
        instance.addEventListener(
          "annotationSelection.change",
          (
            selection: InstanceType<
              typeof NutrientViewer.Immutable.List<Annotation>
            > | null
          ) => {
            mixpanelService.track("Annotation Selection Changed", {
              ...baseEventData,
              selection_count: selection ? selection.length : 0,
              event_source: "nutrient_sdk",
            });
          }
        );

        // Annotation interactions
        instance.addEventListener(
          "annotations.press",
          (annotation: Annotation) => {
            mixpanelService.track("Annotation Pressed", {
              ...baseEventData,
              annotation_type:
                annotation.className || annotation.constructor.name,
              annotation_id: annotation.id,
              page_number: annotation.pageIndex + 1,
              event_source: "nutrient_sdk",
            });
          }
        );

        // Text selection
        instance.addEventListener(
          "textSelection.change",
          (
            selection: InstanceType<typeof NutrientViewer.TextSelection> | null
          ) => {
            if (selection?.text && selection.text.trim().length > 0) {
              mixpanelService.track("Text Selection", {
                ...baseEventData,
                text_length: selection.text.length,
                page_number: selection.pageIndex + 1,
                event_source: "nutrient_sdk",
              });
            } else if (selection === null) {
              mixpanelService.track("Text Selection Cleared", {
                ...baseEventData,
                event_source: "nutrient_sdk",
              });
            }
          }
        );

        // Form field updates
        instance.addEventListener(
          "formFieldValues.update",
          (formFieldValues: Record<string, unknown>) => {
            mixpanelService.track("Form Field Updated", {
              ...baseEventData,
              field_count: Object.keys(formFieldValues).length,
              event_source: "nutrient_sdk",
            });
          }
        );

        // Form fields changes
        instance.addEventListener(
          "formFields.change",
          (changes: { type?: string }) => {
            mixpanelService.track("Form Fields Changed", {
              ...baseEventData,
              change_type: changes.type || "unknown",
              event_source: "nutrient_sdk",
            });
          }
        );

        // Search state changes
        instance.addEventListener(
          "search.stateChange",
          (searchState: {
            query?: string;
            results?: unknown[];
            isCaseSensitive?: boolean;
            matchWholeWord?: boolean;
          }) => {
            if (searchState.query?.trim()) {
              mixpanelService.track("Search Performed", {
                ...baseEventData,
                query_length: searchState.query.length,
                results_count: searchState.results
                  ? searchState.results.length
                  : 0,
                is_case_sensitive: searchState.isCaseSensitive || false,
                is_whole_word: searchState.matchWholeWord || false,
                event_source: "nutrient_sdk",
              });
            }
          }
        );

        // Search term changes
        instance.addEventListener(
          "search.termChange",
          (searchTerm: string | null) => {
            mixpanelService.track("Search Term Changed", {
              ...baseEventData,
              search_term_length: searchTerm ? searchTerm.length : 0,
              event_source: "nutrient_sdk",
            });
          }
        );

        // Document changes
        instance.addEventListener(
          "document.change",
          (changes: { type?: string }) => {
            mixpanelService.track("Document Modified", {
              ...baseEventData,
              change_type: changes.type || "unknown",
              event_source: "nutrient_sdk",
            });
          }
        );

        // Document save state changes
        instance.addEventListener(
          "document.saveStateChange",
          (saveState: { hasUnsavedChanges?: boolean }) => {
            mixpanelService.track("Document Save State Changed", {
              ...baseEventData,
              has_changes: saveState.hasUnsavedChanges,
              event_source: "nutrient_sdk",
            });
          }
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
          }
        );

        // Bookmark changes
        instance.addEventListener(
          "bookmarks.change",
          (bookmarks: unknown[] | null) => {
            mixpanelService.track("Bookmarks Changed", {
              ...baseEventData,
              bookmark_count: bookmarks ? bookmarks.length : 0,
              event_source: "nutrient_sdk",
            });
          }
        );

        // Comments changes
        instance.addEventListener(
          "comments.change",
          (comments: unknown[] | null) => {
            mixpanelService.track("Comments Changed", {
              ...baseEventData,
              comment_count: comments ? comments.length : 0,
              event_source: "nutrient_sdk",
            });
          }
        );

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
          }
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
    []
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
        .then(async (instance: NutrientViewerInstance) => {
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
  }, [viewerInstance, documentInfo, fileName]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
