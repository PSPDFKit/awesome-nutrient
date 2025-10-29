type NutrientViewerInstance = Awaited<ReturnType<typeof NutrientViewer.load>>;
type Annotation = InstanceType<typeof NutrientViewer.Annotations.Annotation>;
type AnnotationsList = InstanceType<
  typeof NutrientViewer.Immutable.List<Annotation>
>;
type ToolbarItem = {
  type: string;
  id?: string;
  title?: string;
  icon?: string;
  onPress?: () => Promise<void>;
};

// Module scripts automatically wait for the page to load
// Execute immediately since NutrientViewer is loaded via script tag in HTML
(function () {
  if (!NutrientViewer) {
    console.error(
      "NutrientViewer not found. Make sure the CDN script is loaded."
    );
    return;
  }

  let globalInstance: NutrientViewerInstance | null = null;

  NutrientViewer.load({
    container: "#nutrient-viewer",
    document: "document.pdf",
    toolbarItems: [...NutrientViewer.defaultToolbarItems, { type: "comment" }],
    initialViewState: new NutrientViewer.ViewState({
      sidebarOptions: {
        [NutrientViewer.SidebarMode.ANNOTATIONS]: {
          includeContent: [NutrientViewer.Comment],
        },
      },
    }),
    styleSheets: ["index.css"],
    annotationToolbarItems: (
      annotation: Annotation,
      {
        defaultAnnotationToolbarItems,
      }: { defaultAnnotationToolbarItems: ToolbarItem[] }
    ) => {
      const isHighlight =
        annotation instanceof NutrientViewer.Annotations.HighlightAnnotation;
      const isStrikeOut =
        annotation instanceof NutrientViewer.Annotations.StrikeOutAnnotation;
      const isUnderline =
        annotation instanceof NutrientViewer.Annotations.UnderlineAnnotation;
      const isSquiggly =
        annotation instanceof NutrientViewer.Annotations.SquiggleAnnotation;

      if (!isHighlight && !isStrikeOut && !isUnderline && !isSquiggly) {
        return defaultAnnotationToolbarItems.filter(
          (item: ToolbarItem) => item.type !== "annotation-note"
        );
      }

      // This workaround (provided by https://github.com/andreas-schoch) is to simply create a dummy comment, select it and immediately hide it so user never sees it.
      // As long as it is selected it will show the UI to create a reply comment (looks exactly like the "new comment form").
      // Once user unselects it, it will delete the dummy comment and the reply will become the first comment in the thread.
      const addCommentItem = {
        id: "add-comment",
        type: "custom",
        title: "Add Comment",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" size="24"><path fill-rule="evenodd" d="M5 3.25A2.75 2.75 0 0 0 2.25 6v10A2.75 2.75 0 0 0 5 18.75h1.25V22a.75.75 0 0 0 1.248.56l4.287-3.81H19A2.75 2.75 0 0 0 21.75 16V6A2.75 2.75 0 0 0 19 3.25zM3.75 6c0-.69.56-1.25 1.25-1.25h14c.69 0 1.25.56 1.25 1.25v10c0 .69-.56 1.25-1.25 1.25h-7.5a.75.75 0 0 0-.498.19L7.75 20.33V18a.75.75 0 0 0-.75-.75H5c-.69 0-1.25-.56-1.25-1.25zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2m9-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clip-rule="evenodd"></path></svg>\n',
        onPress: async () => {
          const updated = await globalInstance.update(
            annotation.set("isCommentThreadRoot", true)
          );
          annotation = updated[0];

          // Always hidden via CSS --> [data-comment-id="dummy_comment"] { display: none !important; }
          const dummyComment = new NutrientViewer.Comment({
            id: "dummy_comment",
            rootId: annotation.id,
            pageIndex: annotation.pageIndex,
            creatorName: "System",
            text: { format: "plain", value: "dummy_comment" },
          });

          await globalInstance.create([dummyComment]);
          globalInstance.setSelectedAnnotations(
            NutrientViewer.Immutable.List([annotation])
          );

          // CLEANUP DUMMY COMMENT
          const handleUnselect = async (annotations: AnnotationsList) => {
            if (!globalInstance) return;
            await globalInstance.delete([dummyComment]);

            const comments = await globalInstance.getComments();
            const numCommentsInThread = comments.filter(
              (c: InstanceType<typeof NutrientViewer.Comment>) =>
                c.rootId === annotation.id
            ).size;
            if (numCommentsInThread === 0) {
              annotation = annotation.set("isCommentThreadRoot", false);
              await globalInstance.update([annotation]);
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

      const items = defaultAnnotationToolbarItems.filter(
        (item: ToolbarItem) => item.type !== "annotation-note"
      );
      items.push(addCommentItem);
      return items;
    },
  })
    .then((instance: NutrientViewerInstance) => {
      globalInstance = instance;
      instance.addEventListener(
        "annotations.update",
        async (event: AnnotationsList) => {
          const annotation = event.toArray()[0];
          if (annotation?.customData?.commentAnnotationID) {
            try {
              // Update the comment annotation when the parent annotation is updated
              let commentAnnotation = annotation.customData.commentAnnotation;
              commentAnnotation = commentAnnotation.set(
                "boundingBox",
                annotation.boundingBox
              );
              const update = await instance.update(commentAnnotation);
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
          annotation: Annotation;
          preventDefault: () => void;
        }) => {
          if (
            event.annotation instanceof
              NutrientViewer.Annotations.CommentMarkerAnnotation &&
            event.annotation.customData.parentAnnotation
          ) {
            event.preventDefault();
            const parentAnnotationID =
              event.annotation.customData.parentAnnotation.id;
            await instance.setSelectedAnnotations(
              NutrientViewer.Immutable.List([parentAnnotationID])
            );
          }
        }
      );
    })
    .catch((error: Error) => {
      console.error(error.message);
    });
})();
