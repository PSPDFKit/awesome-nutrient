import type {
  Instance,
  AnnotationsUnion,
  AnnotationToolbarItem,
  List,
  Comment,
} from "@nutrient-sdk/viewer";

let globalInstance: Instance | null = null;

(function () {
  if (!window.NutrientViewer) {
    console.error(
      "NutrientViewer not found. Make sure the CDN script is loaded."
    );
    return;
  }

  window.NutrientViewer.load({
    container: "#nutrient-viewer",
    document: "document.pdf",
    toolbarItems: [
      ...window.NutrientViewer.defaultToolbarItems,
      { type: "comment" },
    ],
    initialViewState: new window.NutrientViewer.ViewState({
      sidebarOptions: {
        [window.NutrientViewer.SidebarMode.ANNOTATIONS]: {
          includeContent: [window.NutrientViewer.Comment],
        },
      },
    }),
    styleSheets: ["index.css"],
    annotationToolbarItems: (
      annotation: AnnotationsUnion | null,
      {
        defaultAnnotationToolbarItems,
      }: { defaultAnnotationToolbarItems: AnnotationToolbarItem[] }
    ) => {
      if (!annotation) return defaultAnnotationToolbarItems;

      const isHighlight =
        annotation instanceof
        window.NutrientViewer.Annotations.HighlightAnnotation;
      const isStrikeOut =
        annotation instanceof
        window.NutrientViewer.Annotations.StrikeOutAnnotation;
      const isUnderline =
        annotation instanceof
        window.NutrientViewer.Annotations.UnderlineAnnotation;
      const isSquiggly =
        annotation instanceof
        window.NutrientViewer.Annotations.SquiggleAnnotation;

      if (!isHighlight && !isStrikeOut && !isUnderline && !isSquiggly) {
        return defaultAnnotationToolbarItems;
      }

      // This workaround (provided by https://github.com/andreas-schoch) is to simply create a dummy comment, select it and immediately hide it so user never sees it.
      // As long as it is selected it will show the UI to create a reply comment (looks exactly like the "new comment form").
      // Once user unselects it, it will delete the dummy comment and the reply will become the first comment in the thread.
      const addCommentItem: AnnotationToolbarItem = {
        id: "add-comment",
        type: "custom" as const,
        title: "Add Comment",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" size="24"><path fill-rule="evenodd" d="M5 3.25A2.75 2.75 0 0 0 2.25 6v10A2.75 2.75 0 0 0 5 18.75h1.25V22a.75.75 0 0 0 1.248.56l4.287-3.81H19A2.75 2.75 0 0 0 21.75 16V6A2.75 2.75 0 0 0 19 3.25zM3.75 6c0-.69.56-1.25 1.25-1.25h14c.69 0 1.25.56 1.25 1.25v10c0 .69-.56 1.25-1.25 1.25h-7.5a.75.75 0 0 0-.498.19L7.75 20.33V18a.75.75 0 0 0-.75-.75H5c-.69 0-1.25-.56-1.25-1.25zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2m9-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clip-rule="evenodd"></path></svg>\n',
        onPress: async () => {
          if (!globalInstance || !annotation) return;
          if (
            !("id" in annotation) ||
            !("pageIndex" in annotation) ||
            !annotation.id
          )
            return;

          const updated = await globalInstance.update(
            annotation.set("isCommentThreadRoot", true)
          );

          const currentAnnotation = updated[0];
          if (
            !currentAnnotation ||
            !("id" in currentAnnotation) ||
            !("pageIndex" in currentAnnotation) ||
            !currentAnnotation.id
          )
            return;

          // Always hidden via CSS --> [data-comment-id="dummy_comment"] { display: none !important; }
          const dummyComment = new window.NutrientViewer.Comment({
            id: "dummy_comment",
            rootId: currentAnnotation.id,
            pageIndex: currentAnnotation.pageIndex,
            creatorName: "System",
            text: { format: "plain", value: "dummy_comment" },
          });

          await globalInstance.create([dummyComment]);
          globalInstance.setSelectedAnnotations(
            window.NutrientViewer.Immutable.List([currentAnnotation.id])
          );

          // CLEANUP DUMMY COMMENT
          const handleUnselect = async () => {
            if (
              !globalInstance ||
              !currentAnnotation ||
              !("id" in currentAnnotation)
            )
              return;
            await globalInstance.delete([dummyComment]);

            const comments = await globalInstance.getComments();
            const numCommentsInThread = comments.filter(
              (c: Comment) => c.rootId === currentAnnotation.id
            ).size;
            if (numCommentsInThread === 0) {
              // @ts-expect-error - AnnotationsUnion is a union type, but instances have set method
              const updatedAnnotation = currentAnnotation.set(
                "isCommentThreadRoot",
                false
              );
              await globalInstance.update([updatedAnnotation]);
            }

            globalInstance.removeEventListener(
              "annotationSelection.change",
              handleUnselect
            );
          };
          globalInstance.addEventListener(
            "annotationSelection.change",
            handleUnselect
          );
        },
      };

      return [...defaultAnnotationToolbarItems, addCommentItem];
    },
  })
    .then((instance: Instance) => {
      globalInstance = instance;
      instance.addEventListener(
        "annotations.update",
        async (event: List<AnnotationsUnion>) => {
          const annotation = event.toArray()[0];
          if (
            annotation?.customData?.commentAnnotationID &&
            annotation.customData.commentAnnotation &&
            typeof annotation.customData.commentAnnotation === "object" &&
            "set" in annotation.customData.commentAnnotation &&
            "boundingBox" in annotation
          ) {
            try {
              // Update the comment annotation when the parent annotation is updated
              const commentAnnotation = annotation.customData.commentAnnotation;
              // @ts-expect-error - set method exists on annotation types
              const updatedCommentAnnotation = commentAnnotation.set(
                "boundingBox",
                annotation.boundingBox
              );
              await instance.update(updatedCommentAnnotation);
            } catch (error) {
              console.warn(error);
            }
          }
        }
      );
      // When a comment is pressed, select the parent annotation
      instance.addEventListener(
        "annotations.press",
        async (event: {
          annotation: AnnotationsUnion;
          preventDefault?: () => void;
        }) => {
          if (
            event.annotation instanceof
              window.NutrientViewer.Annotations.CommentMarkerAnnotation &&
            event.annotation.customData &&
            event.annotation.customData.parentAnnotation &&
            typeof event.annotation.customData.parentAnnotation === "object" &&
            "id" in event.annotation.customData.parentAnnotation
          ) {
            event.preventDefault?.();
            const parentAnnotationID = event.annotation.customData
              .parentAnnotation.id as string;
            await instance.setSelectedAnnotations(
              window.NutrientViewer.Immutable.List([parentAnnotationID])
            );
          }
        }
      );
    })
    .catch((error: Error) => {
      console.error(error.message);
    });
})();
