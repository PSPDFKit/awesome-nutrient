import type {
  AnnotationTooltipCallback,
  Instance,
  RedactionAnnotation,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let instance: Instance | null = null;

const getAllAnnotations = async () => {
  if (!instance)
    return window.NutrientViewer.Immutable.List<RedactionAnnotation>();

  let annotationsList =
    window.NutrientViewer.Immutable.List<RedactionAnnotation>();

  for (let i = 0; i < instance.totalPageCount; i++) {
    const anns = (await instance.getAnnotations(i)).filter(
      (a): a is RedactionAnnotation =>
        a instanceof window.NutrientViewer.Annotations.RedactionAnnotation,
    );
    annotationsList = annotationsList.concat(anns);
  }
  return annotationsList;
};

const redactionAnnotationsHandlerCallback: AnnotationTooltipCallback = (
  annotation,
) =>
  annotation instanceof window.NutrientViewer.Annotations.RedactionAnnotation
    ? [
        {
          type: "custom",
          title: "Accept",
          id: "tooltip-accept-annotation",
          className: "TooltipItem-Duplication",
          onPress: async () => {
            if (!instance) return;

            const allRedactionAnnotations = (await getAllAnnotations()).filter(
              (a) => a.id !== annotation.id,
            );

            await instance.delete(allRedactionAnnotations);
            await instance.applyRedactions();
            await instance.create(allRedactionAnnotations);
          },
        },
        {
          type: "custom",
          title: "Reject",
          id: "tooltip-reject-annotation",
          className: "TooltipItem-Duplication",
          onPress: async () => {
            if (!instance) return;
            instance.delete(annotation);
          },
        },
      ]
    : [];

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  enableAutomaticLinkExtraction: true,
  annotationTooltipCallback: redactionAnnotationsHandlerCallback,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "redact-rectangle" },
    { type: "redact-text-highlighter" },
  ],
}).then((_instance) => {
  instance = _instance;
});
