import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then(async (instance) => {
  const request = await fetch("https://picsum.photos/id/237/300/300");
  const blob = await request.blob();
  const imageAttachmentId = await instance.createAttachment(blob);
  const annotation = new window.NutrientViewer.Annotations.ImageAnnotation({
    pageIndex: 0,
    contentType: "image/png",
    imageAttachmentId,
    description: "Example Image Annotation",
    boundingBox: new window.NutrientViewer.Geometry.Rect({
      left: 10,
      top: 20,
      width: 150,
      height: 150,
    }),
    action: new window.NutrientViewer.Actions.URIAction({
      uri: "https://picsum.photos/id/237/300/300",
    }),
  });
  await instance.create(annotation);
});
