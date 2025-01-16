const PSPDFKit = window.PSPDFKit;

// We need to inform PSPDFKit where to look for its library assets, i.e. the location of the `pspdfkit-lib` directory.
const baseUrl = 'https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.4.0/';

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

const setCommentColor = (ele, currStatus) => {
  if(_instance && _instance.contentDocument){
    const commentDiv = ele.current;
    if(commentDiv){
      if("approved" === currStatus){
        commentDiv.style.backgroundColor = "lightgreen";
      }
      else if("rejected" === currStatus){
        commentDiv.style.backgroundColor = "lightcoral";
      }
    }
  }
}

const {
  UI: { createBlock, Recipes, Interfaces, Core },
} = PSPDFKit;

PSPDFKit.load({
  ui: {
    [Interfaces.CommentThread]: ({ props: props }) => ({
      content: createBlock(Recipes.CommentThread, props, ({ ui: ui }) => {
        const comment = ui.getBlockById("comment");
        if (comment && comment.props) {
          const { menuProps: menuProps } = comment.props;
          menuProps &&
            comment.setProp("menuProps", {
              ...menuProps,
              onAction: (id) => {
                if("approve" === id){
                  setCommentColor(props.ref, "approved");
                  window.alert(`Approved ${props.comments[0].id}`)
                }
                else if("reject" === id){
                  setCommentColor(props.ref, "rejected");
                  window.alert(`Rejected ${props.comments[0].id}`)
                }
                // Add more status as needed
                else{
                  menuProps.onAction(id)
                };
              },
              // Also add status here
              items: [...menuProps.items, { id: "approve", label: "Approve" }, { id: "reject", label: "Reject" }],
            });
        }
        return ui.createComponent();
      }).createComponent(),
    }),
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
