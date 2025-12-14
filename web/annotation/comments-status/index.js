const NutrientViewer = window.NutrientViewer;

let _instance = null;

const createCommentAnnotation = async (instance, annotation) => {
  const commentID = NutrientViewer.generateInstantId();
  const parentCom = new NutrientViewer.Annotations.CommentMarkerAnnotation({
    id: commentID,
    isCommentThreadRoot: true,
    pageIndex: 0,
    boundingBox: annotation.boundingBox,
    customData: { parentAnnotation: annotation },
  });
  const firstCom = new NutrientViewer.Comment({
    rootId: commentID,
    pageIndex: 0,
    text: { format: "plain", value: "New Annotation Comment" },
  });
  const commentAnnots = await instance.create([parentCom, firstCom]);
  const customData = {
    commentAnnotationID: commentID,
    commentAnnotation: commentAnnots[0],
  };
  const updatedAnnotation = annotation.set("customData", customData);
  const updatedAnnot = await instance.update(updatedAnnotation);
  return updatedAnnot[0];
};

const duplicateAnnotationTooltipCallback = (annotation) => {
  if (annotation instanceof NutrientViewer.Annotations.CommentMarkerAnnotation)
    return [];
  const duplicateItem = {
    type: "custom",
    title: "Comment",
    id: "tooltip-duplicate-annotation",
    className: "TooltipItem-Duplication",
    onPress: async () => {
      if (_instance) {
        if (!(annotation instanceof NutrientViewer.Annotations.CommentMarkerAnnotation)) {
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

const setCommentColor = (ele, currStatus) => {
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
    [Interfaces.CommentThread]: ({ props }) => ({
      content: createBlock(Recipes.CommentThread, props, ({ ui }) => {
        const comment = ui.getBlockById("comment");
        if (comment?.props) {
          const { menuProps } = comment.props;
          menuProps &&
            comment.setProp("menuProps", {
              ...menuProps,
              onAction: (id) => {
                if ("approve" === id) {
                  setCommentColor(props.ref, "approved");
                  window.alert(`Approved ${props.comments[0].id}`);
                } else if ("reject" === id) {
                  setCommentColor(props.ref, "rejected");
                  window.alert(`Rejected ${props.comments[0].id}`);
                } else {
                  menuProps.onAction(id);
                }
              },
              items: [
                ...menuProps.items,
                { id: "approve", label: "Approve" },
                { id: "reject", label: "Reject" },
              ],
            });
        }
        return ui.createComponent();
      }).createComponent(),
    }),
  },
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
  annotationTooltipCallback: duplicateAnnotationTooltipCallback,
})
  .then((instance) => {
    _instance = instance;
    instance.addEventListener("annotations.update", async (event) => {
      const annotation = event.toArray()[0];
      if (annotation?.customData?.commentAnnotationID) {
        try {
          let commentAnnotation = annotation.customData.commentAnnotation;
          commentAnnotation = commentAnnotation.set("boundingBox", annotation.boundingBox);
          const update = await instance.update(commentAnnotation);
          console.log("Annotation updated", update);
        } catch (error) {
          console.warn(error);
        }
      }
    });
    instance.addEventListener("annotations.press", async (event) => {
      if (
        event.annotation instanceof NutrientViewer.Annotations.CommentMarkerAnnotation &&
        event.annotation.customData.parentAnnotation
      ) {
        event.preventDefault();
        const parentAnnotationID = event.annotation.customData.parentAnnotation.id;
        await instance.setSelectedAnnotations(
          NutrientViewer.Immutable.List([parentAnnotationID])
        );
      }
    });
  })
  .catch((error) => {
    console.error(error.message);
  });
