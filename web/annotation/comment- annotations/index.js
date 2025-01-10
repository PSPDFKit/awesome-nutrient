import "./assets/pspdfkit.js";

// We need to inform PSPDFKit where to look for its library assets, i.e. the location of the `pspdfkit-lib` directory.
const baseUrl = `${window.location.protocol}//${window.location.host}/assets/`;

var _instance = null;

const createCommentAnnotation = async (instance, annotation) => {
  // Get the first created annotation
  const commentID = PSPDFKit.generateInstantId();
  // Create a new comment annotation
  const parentCom = new PSPDFKit.Annotations.CommentMarkerAnnotation({
    id: commentID,
    isCommentThreadRoot: true,
    pageIndex: 0,
    // Set the bounding box of the comment annotation
    boundingBox: annotation.boundingBox,
    customData: { parentAnnotation: annotation },
  });
  // Add the first comment to the document
  const firstCom = new PSPDFKit.Comment({
    rootId: commentID,
    // Configure pageIndex
    pageIndex: 0,
    // Set the text of the first comment
    text: { format: "plain", value: "New Annotation Comment" },
  });
  const commentAnnots = await instance.create([parentCom, firstCom]);
  // Add the comment id to the annotation customData
  const customData = { commentAnnotationID: commentID, commentAnnotation: commentAnnots[0]};
  const updatedAnnotation = annotation.set("customData", customData);
  const updatedAnnot = await instance.update(updatedAnnotation);
  return updatedAnnot[0];
};

const duplicateAnnotationTooltipCallback = (annotation) => {
  // If the annotation is a comment marker, dont show the tooltip
  if (annotation instanceof PSPDFKit.Annotations.CommentMarkerAnnotation)
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
          !(annotation instanceof PSPDFKit.Annotations.CommentMarkerAnnotation)
        ) {
          // Create a new comment annotation if it does not exist
          if (
            !(
              annotation.customData && annotation.customData.commentAnnotationID
            )
          )
            annotation = await createCommentAnnotation(_instance, annotation);

          const parentAnnotationID = annotation.customData.commentAnnotationID;
          try{
            await _instance.setSelectedAnnotations(
              PSPDFKit.Immutable.List([parentAnnotationID])
            );
          } catch(error) {console.warn(error); }
        }
      }
    },
  };
  return [duplicateItem];
};

const {
  UI: { createBlock, Recipes, Interfaces, Core },
} = PSPDFKit;

PSPDFKit.load({
  ui: {
    [Interfaces.CommentThread]: ({ props }) => {
      //console.log("Comment thread props", props);
      // Set the comment reactions here
      props.comments.forEach(
        (obj) =>
          (obj.reactions = [
            {
              id: "like",
              "aria-label": "Like",
              count: 2,
              size: "md",
            },
            {
              id: "dislike",
              "aria-label": "Dislike",
              count: 1,
              size: "md",
              icon: `m`
            },
          ])
      );
      return {
        content: createBlock(Recipes.CommentThread, props, ({ ui }) => {
          //console.log("Comment thread ui", ui);
          return ui.createComponent();
        }).createComponent(),
      };
    },
  },
  baseUrl,
  container: "#pspdfkit",
  document: "document.pdf",
  toolbarItems: [...PSPDFKit.defaultToolbarItems, { type: "comment" }],
  initialViewState: new PSPDFKit.ViewState({
    sidebarOptions: {
      [PSPDFKit.SidebarMode.ANNOTATIONS]: {
        includeContent: [PSPDFKit.Comment],
      },
    },
  }),
  annotationTooltipCallback: duplicateAnnotationTooltipCallback,
})
  .then((instance) => {
    _instance = instance;
    instance.addEventListener("annotations.update", async (event) => {
      const annotation = event.toArray()[0];
      if (
        annotation &&
        annotation.customData &&
        annotation.customData.commentAnnotationID
      ) {
        try {
        // Update the comment annotation when the parent annotation is updated
        let commentAnnotation = annotation.customData.commentAnnotation;
        commentAnnotation= commentAnnotation.set("boundingBox",annotation.boundingBox);
        const update = await instance.update(commentAnnotation);
        console.log("Annotation updated", update);
        } catch (error) {console.warn(error);}
      }
    });
    // When a comment is pressed, select the parent annotation
    instance.addEventListener("annotations.press", async (event) => {
      if (
        event.annotation instanceof
          PSPDFKit.Annotations.CommentMarkerAnnotation &&
        event.annotation.customData.parentAnnotation
      ) {
        event.preventDefault();
        const parentAnnotationID =
          event.annotation.customData.parentAnnotation.id;
        await instance.setSelectedAnnotations(
          PSPDFKit.Immutable.List([parentAnnotationID])
        )
        //,console.log("Annotation pressed", event);
      }
    });
  })
  .catch((error) => {
    //console.error(error.message);
  });
