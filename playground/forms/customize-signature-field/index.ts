import type {
  AnnotationsUnion,
  ImageAnnotation,
  InkAnnotation,
  Instance,
  RendererConfiguration,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let globalInstance: Instance;

const user1 = "Nutrient";
const user2 = "NutrientViewer";

const annotationRenderer = ({
  annotation,
}: {
  annotation: AnnotationsUnion;
}): RendererConfiguration | null => {
  if (!annotation.creatorName || annotation.creatorName.length === 0) {
    return null;
  }

  const authorLabel = document.createElement("div");

  if (
    annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation
  ) {
    (async () => {
      const formFields = await globalInstance.getFormFields();
      const field = formFields.find(
        (ff) =>
          ff instanceof window.NutrientViewer.FormFields.SignatureFormField &&
          ff.name === annotation.formFieldName,
      );

      const overlappingSignature =
        await globalInstance.getOverlappingAnnotations(annotation);

      if (field && overlappingSignature.size === 0 && annotation.creatorName) {
        authorLabel.classList.add(`name-label-${annotation.id}`);
        authorLabel.appendChild(
          document.createTextNode(annotation.creatorName),
        );
      }
    })();

    return {
      node: authorLabel,
      append: true,
      noZoom: false,
    };
  }

  return null;
};

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  customRenderers: { Annotation: annotationRenderer },
  isEditableAnnotation: (annotation: AnnotationsUnion): boolean => {
    if (
      annotation instanceof window.NutrientViewer.Annotations.InkAnnotation ||
      annotation instanceof window.NutrientViewer.Annotations.ImageAnnotation
    ) {
      return !(annotation as InkAnnotation | ImageAnnotation).isSignature;
    }
    return true;
  },
}).then(async (instance: Instance) => {
  globalInstance = instance;

  const widget1 = new window.NutrientViewer.Annotations.WidgetAnnotation({
    id: window.NutrientViewer.generateInstantId(),
    pageIndex: 0,
    boundingBox: new window.NutrientViewer.Geometry.Rect({
      left: 100,
      top: 300,
      width: 150,
      height: 75,
    }),
    formFieldName: "form1",
    customData: { isInitials: false },
    creatorName: user1,
  });

  const formField1 = new window.NutrientViewer.FormFields.SignatureFormField({
    name: "form1",
    annotationIds: window.NutrientViewer.Immutable.List([widget1.id]),
  });

  const widget2 = new window.NutrientViewer.Annotations.WidgetAnnotation({
    id: window.NutrientViewer.generateInstantId(),
    pageIndex: 0,
    boundingBox: new window.NutrientViewer.Geometry.Rect({
      left: 355,
      top: 300,
      width: 150,
      height: 75,
    }),
    formFieldName: "form2",
    customData: { isInitials: true },
    creatorName: user2,
  });

  const formField2 = new window.NutrientViewer.FormFields.SignatureFormField({
    name: "form2",
    annotationIds: window.NutrientViewer.Immutable.List([widget2.id]),
  });

  await instance.create([widget1, formField1, widget2, formField2]);
});
