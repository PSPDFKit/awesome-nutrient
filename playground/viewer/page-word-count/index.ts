import type { ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then(async (instance) => {
  // Cache word counts for all pages
  const wordCounts: number[] = [];

  async function getWordCountForPage(pageIndex: number): Promise<number> {
    if (wordCounts[pageIndex] !== undefined) {
      return wordCounts[pageIndex];
    }

    const textLines = await instance.textLinesForPageIndex(pageIndex);
    const pageText = textLines.map((line) => line.contents).join(" ");
    const count = pageText.split(/\s+/).filter(Boolean).length;
    wordCounts[pageIndex] = count;
    return count;
  }

  function updateToolbarWordCount(wordCount: number) {
    instance.setToolbarItems((items) =>
      items.map((item) =>
        item.id === "word-count"
          ? { ...item, title: `Words: ${wordCount}` }
          : item,
      ),
    );
  }

  // Get initial word count for the first page
  const initialWordCount = await getWordCountForPage(0);

  // Add word count display to toolbar
  const wordCountItem: ToolbarItem = {
    type: "custom",
    id: "word-count",
    title: `Words: ${initialWordCount}`,
  };

  instance.setToolbarItems((items) => [...items, wordCountItem]);

  // Update word count when page changes
  instance.addEventListener(
    "viewState.currentPageIndex.change",
    async (pageIndex) => {
      const wordCount = await getWordCountForPage(pageIndex);
      updateToolbarWordCount(wordCount);
    },
  );
});
