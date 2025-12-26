import type { Annotation } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

const username = "Omar";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [{ type: "comment" }],
}).then((instance) => {
  const annotation =
    new window.NutrientViewer.Annotations.CommentMarkerAnnotation({
      id: "test",
      pageIndex: 0,
      boundingBox: new window.NutrientViewer.Geometry.Rect({
        top: 100,
        left: 100,
        width: 10,
        height: 10,
      }),
      customData: { circleId: "my-circle" },
    });

  const comment = new window.NutrientViewer.Comment({
    id: "commentId",
    rootId: "test",
    pageIndex: 0,
    text: { format: "plain", value: "Hello" },
  });

  instance.setAnnotationCreatorName(username);
  instance.create([annotation, comment]);

  instance.addEventListener("annotations.create", (annotations) => {
    const firstAnnotation = annotations.first() as Annotation | undefined;
    if (firstAnnotation) {
      console.log(firstAnnotation.toJS());
    }
  });
});
