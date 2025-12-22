import type { TextComparisonConfiguration } from "@nutrient-sdk/viewer";
import { baseOptions } from "../shared/base-options";

window.NutrientViewer.loadTextComparison({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  documentA:
    "https://public-solutions-engineering-bucket.s3.eu-central-1.amazonaws.com/docs/text-comparison-a.pdf",
  documentB:
    "https://public-solutions-engineering-bucket.s3.eu-central-1.amazonaws.com/docs/text-comparison-b.pdf",
  toolbarItems: [
    { type: "prev-change" },
    { type: "next-change" },
    { type: "comparison-changes" },
    { type: "scroll-lock" },
  ],
  comparisonSidebarConfig: {
    diffColors: {
      deletionColor: new window.NutrientViewer.Color({
        r: 255,
        g: 218,
        b: 185,
      }),
      insertionColor: new window.NutrientViewer.Color({
        r: 200,
        g: 255,
        b: 200,
      }),
    },
  },
} as TextComparisonConfiguration).then((instance) => {
  console.log("Text comparison loaded successfully", instance);
});
