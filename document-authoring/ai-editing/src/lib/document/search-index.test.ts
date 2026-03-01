import { describe, expect, it } from "vitest";
import { ElementSearchIndex } from "@/lib/document/search-index";

describe("ElementSearchIndex.search", () => {
  it("filters out zero-score entries even when minScore is 0", () => {
    const index = new ElementSearchIndex();
    index.rebuild([
      {
        id: "it-0.1.0",
        kind: "inline-text",
        path: [0, 1, 0],
        preview: "Middle",
        searchText: "Middle",
      },
      {
        id: "it-0.1.1",
        kind: "inline-text",
        path: [0, 1, 1],
        preview: "Ages",
        searchText: "Ages",
      },
      {
        id: "it-0.1.2",
        kind: "inline-text",
        path: [0, 1, 2],
        preview: "Poets",
        searchText: "Poets",
      },
    ]);

    const matches = index.search({
      query: "Middle Ages",
      mode: "exact_phrase",
      kinds: ["inline-text"],
      maxResults: 100,
      minScore: 0,
    });

    expect(matches).toEqual([]);
  });
});
