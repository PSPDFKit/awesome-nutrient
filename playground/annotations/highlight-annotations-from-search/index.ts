import type { HighlightAnnotation } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Load window.NutrientViewer with dark theme
window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then(async (instance) => {
  // List of terms to search for in the document
  const namesList = ["primate", "shellfish", "monkey", "macaque"];

  // Creates an array of promises that return the searchResult of each search
  const annotations = (
    await Promise.all(namesList.map((name) => instance.search(name)))
  ).flatMap((searchResults) =>
    searchResults.reduce<HighlightAnnotation[]>((acc, searchResult) => {
      // Extract location information for the found text
      const { rectsOnPage, pageIndex } = searchResult;

      const firstRect = rectsOnPage.first();
      if (!firstRect) return acc;

      // Create bounding box for the highlight
      const bbox = new window.NutrientViewer.Geometry.Rect(firstRect);

      // Create a new highlight annotation
      return acc.concat(
        new window.NutrientViewer.Annotations.HighlightAnnotation({
          id: window.NutrientViewer.generateInstantId(),
          pageIndex: pageIndex,
          boundingBox: bbox,
          rects: rectsOnPage,
          color: window.NutrientViewer.Color.YELLOW,
        }),
      );
    }, []),
  );

  // Apply all highlight annotations to the document
  await instance.create(annotations);
});
