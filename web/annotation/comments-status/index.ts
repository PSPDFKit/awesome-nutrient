type NutrientViewerInstance = Awaited<ReturnType<typeof NutrientViewer.load>>;
type Annotation = InstanceType<typeof NutrientViewer.Annotations.Annotation>;
type AnnotationsList = InstanceType<
  typeof NutrientViewer.Immutable.List<Annotation>
>;

// We need to inform NutrientViewer where to look for its library assets
const baseUrl = "https://cdn.cloud.pspdfkit.com/pspdfkit-web@1.5.0/";

let _instance: NutrientViewerInstance | null = null;

const createCommentAnnotation = async (
  instance: NutrientViewerInstance,
  annotation: Annotation
): Promise<Annotation> => {
  // Get the first created annotation
  const commentID = NutrientViewer.generateInstantId();
  // Create a new comment annotation
  const parentCom = new NutrientViewer.Annotations.CommentMarkerAnnotation({
    id: commentID,
    isCommentThreadRoot: true,
    pageIndex: 0,
    // Set the bounding box of the comment annotation
    boundingBox: annotation.boundingBox,
    customData: { parentAnnotation: annotation },
  });
  // Add the first comment to the document
  const firstCom = new NutrientViewer.Comment({
    rootId: commentID,
    // Configure pageIndex
    pageIndex: 0,
    // Set the text of the first comment
    text: { format: "plain", value: "New Annotation Comment" },
  });
  const commentAnnots = await instance.create([parentCom, firstCom]);
  // Add the comment id to the annotation customData
  const customData = {
    commentAnnotationID: commentID,
    commentAnnotation: commentAnnots[0],
  };
  const updatedAnnotation = annotation.set("customData", customData);
  const updatedAnnot = await instance.update(updatedAnnotation);
  return updatedAnnot[0];
};

const duplicateAnnotationTooltipCallback = (annotation: Annotation) => {
  // If the annotation is a comment marker, dont show the tooltip
  if (annotation instanceof NutrientViewer.Annotations.CommentMarkerAnnotation)
    return [];
  // Create a custom tooltip item with title "Comment"
  const duplicateItem = {
    type: "custom",
    title: "Comment",
    id: "tooltip-duplicate-annotation",
    className: "TooltipItem-Duplication",
    onPress: async () => {
      //console.log("Annotation pressed", annotation);
      if (_instance) {
        if (
          !(
            annotation instanceof
            NutrientViewer.Annotations.CommentMarkerAnnotation
          )
        ) {
          // Create a new comment annotation if it does not exist
          if (!annotation.customData?.commentAnnotationID)
            annotation = await createCommentAnnotation(_instance, annotation);

          const parentAnnotationID = annotation.customData.commentAnnotationID;
          try {
            await _instance.setSelectedAnnotations(
              NutrientViewer.Immutable.List([parentAnnotationID])
            );
          } catch (error) {
            console.warn(error);
          }
        }
      }
    },
  };
  return [duplicateItem];
};

const setCommentColor = (
  ele: { current?: HTMLElement | null },
  currStatus: string
) => {
  if (_instance?.contentDocument) {
    const commentDiv = ele.current;
    if (commentDiv) {
      if ("approved" === currStatus) {
        commentDiv.style.backgroundColor = "lightgreen";
      } else if ("rejected" === currStatus) {
        commentDiv.style.backgroundColor = "lightcoral";
      }
    }
  }
};

const {
  UI: { createBlock, Recipes, Interfaces },
} = NutrientViewer;

NutrientViewer.load({
  ui: {
    [Interfaces.CommentThread]: ({
      props,
    }: {
      props: {
        ref: { current?: HTMLElement | null };
        comments: Array<{ id: string }>;
      };
    }) => ({
      content: createBlock(
        Recipes.CommentThread,
        props,
        ({
          ui,
        }: {
          ui: {
            getBlockById: (id: string) =>
              | {
                  props?: {
                    menuProps?: {
                      onAction: (id: string) => void;
                      items: Array<{ id: string; label: string }>;
                    };
                  };
                  setProp: (key: string, value: unknown) => void;
                }
              | undefined;
            createComponent: () => unknown;
          };
        }) => {
          const comment = ui.getBlockById("comment");
          if (comment?.props) {
            const { menuProps } = comment.props;
            menuProps &&
              comment.setProp("menuProps", {
                ...menuProps,
                onAction: (id: string) => {
                  if ("approve" === id) {
                    setCommentColor(props.ref, "approved");
                    window.alert(`Approved ${props.comments[0].id}`);
                  } else if ("reject" === id) {
                    setCommentColor(props.ref, "rejected");
                    window.alert(`Rejected ${props.comments[0].id}`);
                  }
                  // Add more status as needed
                  else {
                    menuProps.onAction(id);
                  }
                },
                // Also add status here
                items: [
                  ...menuProps.items,
                  { id: "approve", label: "Approve" },
                  { id: "reject", label: "Reject" },
                ],
              });
          }
          return ui.createComponent();
        }
      ).createComponent(),
    }),
  },
  baseUrl,
  container: "#pspdfkit",
  document: "document.pdf",
  toolbarItems: [...NutrientViewer.defaultToolbarItems, { type: "comment" }],
  initialViewState: new NutrientViewer.ViewState({
    sidebarOptions: {
      [NutrientViewer.SidebarMode.ANNOTATIONS]: {
        includeContent: [NutrientViewer.Comment],
      },
    },
  }),
  annotationTooltipCallback: duplicateAnnotationTooltipCallback,
})
  .then((instance: NutrientViewerInstance) => {
    _instance = instance;
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
            console.log("Annotation updated", update);
          } catch (error) {
            console.warn(error);
          }
        }
      }
    );
    // When a comment is pressed, select the parent annotation
    instance.addEventListener(
      "annotations.press",
      async (event: { annotation: Annotation; preventDefault: () => void }) => {
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
          //,console.log("Annotation pressed", event);
        }
      }
    );
  })
  .catch((error: Error) => {
    console.error(error.message);
  });
