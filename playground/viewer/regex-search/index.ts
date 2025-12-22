import type { Events } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({ ...baseOptions }).then((instance) => {
  let lastSearchTerm = "";

  instance.addEventListener(
    "search.termChange",
    async (event: Events.SearchTermChangeEvent) => {
      // Opt out from the default implementation
      event.preventDefault?.();

      const { term } = event;

      // Update the search term in the search box. Without this line,
      // the search box would stay empty.
      instance.setSearchState((state) => state.set("term", term));
      lastSearchTerm = term;

      // Perform a regex search for the term
      const results = await instance.search(term, {
        searchType: window.NutrientViewer.SearchType.REGEX,
      });

      // Our results could return in a different order than expected.
      // Let's make sure only results matching our current term are applied.
      if (term !== lastSearchTerm) return;

      // Finally, we apply the results
      const newState = instance.searchState.set("results", results);
      instance.setSearchState(newState);
    },
  );
});
