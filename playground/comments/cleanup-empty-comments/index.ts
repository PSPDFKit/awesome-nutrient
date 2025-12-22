import type { AnnotationsUnion, Comment, Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Clean up empty comment threads and highlights when user cancels without adding content

let observer: MutationObserver | null = null;
let hasBeenEdited = false;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "comment" },
  ],
  ui: {
    commentThread: {
      editor: (instance, _threadId) => {
        return {
          render: () => null, // Use default editor UI
          onMount: (rootId) => {
            if (!instance) return;

            if (!observer) {
              observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                  let container: Element | null = null;
                  if (mutation.type === "characterData") {
                    container =
                      (mutation.target as Node).parentElement?.closest?.(
                        ".BaselineUI-Editor-RichEditorEditingArea",
                      ) ?? null;
                  } else {
                    container =
                      (mutation.target as Element).closest?.(
                        ".BaselineUI-Editor-RichEditorEditingArea",
                      ) ?? null;
                  }

                  if (container) {
                    const textContent = container.textContent?.trim();
                    hasBeenEdited =
                      !!textContent &&
                      !textContent.includes("Add your comment");
                    break;
                  }
                }
              });
            }

            const container =
              instance.contentDocument.querySelector(
                `[data-root-id="${rootId}"] .BaselineUI-Editor-RichEditorEditingArea`,
              ) ||
              instance.contentDocument.querySelector(
                ".BaselineUI-Editor-RichEditorEditingArea",
              );

            if (container) {
              observer.observe(container, {
                childList: true,
                attributes: true,
                subtree: true,
                characterData: true,
              });
            }
          },
          onUnmount: async (rootId) => {
            if (!instance) return;

            observer?.disconnect();

            // If comments exist or editor had content, keep the marker
            const hasComments = (await instance.getComments()).find(
              (comment: Comment) => comment.rootId === rootId,
            );
            if (hasComments || hasBeenEdited) {
              hasBeenEdited = false;
              return;
            }

            // Remove lingering empty comment marker
            const { currentPageIndex } = instance.viewState;
            const lingeringMarkers = (
              await instance.getAnnotations(currentPageIndex)
            ).filter(
              (annotation: AnnotationsUnion) => annotation.id === rootId,
            );

            if (lingeringMarkers.size > 0) {
              await instance.delete(lingeringMarkers);
            }

            hasBeenEdited = false;
          },
        };
      },
    },
  },
}).then((instance: Instance) => {
  // ESC key handling: delete empty comment markers
  instance.contentDocument.addEventListener("keydown", async (event) => {
    if ((event as KeyboardEvent).key !== "Escape") return;

    const selected = instance.getSelectedAnnotations();
    if (!selected || selected.size === 0) return;

    const selectedFirst = selected.first() as AnnotationsUnion;

    const comments = await instance.getComments();
    const hasComments = comments.some(
      (comment: Comment) => comment?.rootId === selectedFirst.id,
    );

    const isCommentMarker =
      selectedFirst instanceof
      window.NutrientViewer.Annotations.CommentMarkerAnnotation;

    const shouldDelete =
      (!selectedFirst.isCommentThreadRoot && isCommentMarker) ||
      (!hasComments && selectedFirst.isCommentThreadRoot);

    if (shouldDelete) {
      await instance.delete(selected);
    }
  });
});
