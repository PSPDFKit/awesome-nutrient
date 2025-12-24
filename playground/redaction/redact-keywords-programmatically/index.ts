import { baseOptions } from "../../shared/base-options";

const SENSITIVE_DATA = {
  places: ["Koram", "NomSao", "Uganda", "Ngogo", "Thailand", "Myanmar"],
  names: [
    "Lydia V Luncz",
    "Amanda Tan",
    "Michael Haslam",
    "Lars Kulik",
    "Tomos Proffitt",
    "Suchinda Malaivijitnond",
    "Michael Gumert",
  ],
};

const REDACTION_SEARCH_OPTIONS = {
  searchType: window.NutrientViewer.SearchType.TEXT,
  searchInAnnotations: false,
  caseSensitive: false,
  startPageIndex: 0,
} as const;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then(async (instance) => {
  await Promise.all(
    SENSITIVE_DATA.places.map((place) =>
      instance.createRedactionsBySearch(place, REDACTION_SEARCH_OPTIONS),
    ),
  );

  await Promise.all(
    SENSITIVE_DATA.names.map((name) =>
      instance.createRedactionsBySearch(name, REDACTION_SEARCH_OPTIONS),
    ),
  );

  await instance.applyRedactions();
});
