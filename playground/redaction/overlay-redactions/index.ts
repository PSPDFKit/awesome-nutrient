import type { RedactionAnnotation, TextLine } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

const REDACTION_CONFIG = {
  color: window.NutrientViewer.Color.RED,
  overlayText: "REDACTED",
};

function createRedactionFromTextLine(textLine: TextLine) {
  const { boundingBox, pageIndex } = textLine;

  return new window.NutrientViewer.Annotations.RedactionAnnotation({
    id: window.NutrientViewer.generateInstantId(),
    pageIndex,
    boundingBox,
    rects: window.NutrientViewer.Immutable.List([boundingBox]),
    ...REDACTION_CONFIG,
  });
}

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then(async (instance) => {
  const pageIndices = Array.from({ length: instance.totalPageCount });

  const allPagesTextLines = await Promise.all(
    pageIndices.map((_, index) => instance.textLinesForPageIndex(index)),
  );

  const redactionAnnotations = allPagesTextLines.flatMap((pageTextLines) =>
    pageTextLines.reduce<RedactionAnnotation[]>(
      (annotations, textLine) => [
        ...annotations,
        createRedactionFromTextLine(textLine),
      ],
      [],
    ),
  );

  await instance.create(redactionAnnotations);
  await instance.applyRedactions();
});
