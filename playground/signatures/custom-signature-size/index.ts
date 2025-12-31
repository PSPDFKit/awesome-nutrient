import type {
  DrawingPoint,
  ImageAnnotation,
  InkAnnotation,
  Instance,
  List,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

const scalingFactorTypeSignature = 0.2;
const scalingFactorDrawSignature = 0.2;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance: Instance) => {
  instance.addEventListener(
    "annotations.create",
    async (createdAnnotations) => {
      const typeSignatures = createdAnnotations.filter(
        (annotation): annotation is ImageAnnotation =>
          annotation instanceof
          window.NutrientViewer.Annotations.ImageAnnotation,
      );

      const firstTypeSignature = typeSignatures.first() as
        | ImageAnnotation
        | undefined;

      if (firstTypeSignature?.isSignature) {
        const boundingBox = firstTypeSignature.boundingBox;
        const newWidth = scalingFactorTypeSignature * boundingBox.width;
        const newHeight = scalingFactorTypeSignature * boundingBox.height;
        const newLeft = boundingBox.left + (boundingBox.width - newWidth) / 2;
        const newTop = boundingBox.top + (boundingBox.height - newHeight) / 2;

        const newBoundingBox = new window.NutrientViewer.Geometry.Rect({
          left: newLeft,
          top: newTop,
          width: newWidth,
          height: newHeight,
        });

        const newAnnotation = firstTypeSignature.set(
          "boundingBox",
          newBoundingBox,
        );
        await instance.update(newAnnotation);
        return;
      }

      const inkSignatures = createdAnnotations.filter(
        (annotation): annotation is InkAnnotation =>
          annotation instanceof
            window.NutrientViewer.Annotations.InkAnnotation &&
          annotation.isSignature,
      );

      if (inkSignatures.size > 0) {
        const scaledAnnotations = inkSignatures.map((annotation) => {
          const boundingBox = annotation.boundingBox;
          if (!boundingBox) return annotation;

          const scaledBoundingBox = boundingBox
            .scale(scalingFactorDrawSignature)
            .merge({
              left: boundingBox.left + boundingBox.width / 4,
              top: boundingBox.top + boundingBox.height / 4,
            });

          const scaledLines = annotation.lines.map((line: List<DrawingPoint>) =>
            line.map((point: DrawingPoint) =>
              point
                .translate({
                  x: -boundingBox.left,
                  y: -boundingBox.top,
                })
                .scale(scalingFactorDrawSignature)
                .translate({
                  x: boundingBox.left + boundingBox.width / 4,
                  y: boundingBox.top + boundingBox.height / 4,
                }),
            ),
          );

          return annotation
            .set("boundingBox", scaledBoundingBox)
            .set("lines", scaledLines);
        });

        await instance.update(scaledAnnotations);
      }
    },
  );
});
