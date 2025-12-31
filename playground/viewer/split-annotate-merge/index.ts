import type { InstantJSON, Serializers } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Load in headless mode for processing
window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  headless: true,
}).then(async (instance) => {
  const totalPages = instance.totalPageCount;
  const pageIndexes = Array.from({ length: totalPages }, (_, i) => i);
  const midpoint = Math.ceil(totalPages / 2);

  const firstHalfIndexes = pageIndexes.slice(0, midpoint);
  const secondHalfIndexes = pageIndexes.slice(midpoint);

  // Annotation to add to the first half (rectangle on first page)
  const rectangleAnnotation = {
    bbox: [100, 150, 200, 75],
    blendMode: "normal",
    createdAt: new Date().toISOString(),
    id: "demo-annotation",
    name: "demo-annotation",
    opacity: 1,
    pageIndex: 0,
    strokeColor: "#2293FB",
    strokeWidth: 5,
    type: "pspdfkit/shape/rectangle",
    updatedAt: new Date().toISOString(),
    v: 1,
  } as Serializers.AnnotationJSONUnion;

  const annotationJson: InstantJSON = {
    format: "https://pspdfkit.com/instant-json/v1",
    annotations: [rectangleAnnotation],
  };

  // Export first half with annotation applied
  const firstHalfBuffer = await instance.exportPDFWithOperations([
    { type: "removePages", pageIndexes: secondHalfIndexes },
    { type: "applyInstantJson", instantJson: annotationJson },
  ]);

  // Export second half
  const secondHalfBuffer = await instance.exportPDFWithOperations([
    { type: "removePages", pageIndexes: firstHalfIndexes },
  ]);

  // Unload the original headless instance
  await window.NutrientViewer.unload(instance);

  // Load the first half (with annotation) and append the second half
  const tempInstance = await window.NutrientViewer.load({
    ...baseOptions,
    document: firstHalfBuffer,
    headless: true,
  });

  // Merge: append the second half to the first half
  const secondHalfBlob = new Blob([secondHalfBuffer], {
    type: "application/pdf",
  });
  const mergedBuffer = await tempInstance.exportPDFWithOperations([
    {
      type: "importDocument",
      beforePageIndex: firstHalfIndexes.length,
      treatImportedDocumentAsOnePage: false,
      document: secondHalfBlob,
    },
  ]);

  // Unload the temporary instance
  await window.NutrientViewer.unload(tempInstance);

  // Load the merged result in normal mode
  const { document: _, ...restOptions } = baseOptions;
  await window.NutrientViewer.load({
    ...restOptions,
    document: mergedBuffer,
    theme: window.NutrientViewer.Theme.DARK,
  });
});
