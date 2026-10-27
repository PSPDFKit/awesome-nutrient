import type {
  Instance,
  ToolbarItem,
  WidgetAnnotation,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let instance: Instance | null = null;
let requiredWidgets: WidgetAnnotation[] = [];
let index = -1;

// Collect one widget per required form field, page by page. Reading through
// the API instead of the DOM also finds fields on pages that haven't rendered.
const collectRequiredWidgets = async (instance: Instance) => {
  const formFields = await instance.getFormFields();
  // Skip read-only fields, since users can't fill them.
  const requiredNames = new Set(
    formFields
      .filter((field) => field.required && !field.readOnly)
      .map((field) => field.name),
  );
  const widgets: WidgetAnnotation[] = [];

  for (let pageIndex = 0; pageIndex < instance.totalPageCount; pageIndex++) {
    // Stop once every required field has a widget.
    if (requiredNames.size === 0) break;

    const annotations = await instance.getAnnotations(pageIndex);
    annotations.forEach((annotation) => {
      if (
        annotation instanceof NutrientViewer.Annotations.WidgetAnnotation &&
        requiredNames.has(annotation.formFieldName)
      ) {
        widgets.push(annotation);
        // Keep one widget per field, so a radio group is a single stop.
        requiredNames.delete(annotation.formFieldName);
      }
    });
  }

  return widgets;
};

const showRequiredField = (instance: Instance | null) => {
  const widget = requiredWidgets[index];
  if (!instance || !widget) return;

  // Add a 40-point margin around the field before zooming to it.
  instance.jumpAndZoomToRect(widget.pageIndex, widget.boundingBox.grow(40));
  // Selecting the widget moves focus into most field types. For an empty
  // signature field, it opens the signature dialog instead.
  instance.setSelectedAnnotations(NutrientViewer.Immutable.List([widget.id]));
};

const goToNextRequired = (instance: Instance | null) => {
  if (requiredWidgets.length === 0) return;
  // Start over after the last field.
  index = (index + 1) % requiredWidgets.length;
  showRequiredField(instance);
};

const goToPreviousRequired = (instance: Instance | null) => {
  if (requiredWidgets.length === 0) return;
  // Go to the last field from the first one.
  index = (index <= 0 ? requiredWidgets.length : index) - 1;
  showRequiredField(instance);
};

const navigationItems: ToolbarItem[] = [
  {
    type: "custom",
    id: "previous-required-field",
    title: "Previous required field",
    onPress: () => goToPreviousRequired(instance),
  },
  {
    type: "custom",
    id: "next-required-field",
    title: "Next required field",
    onPress: () => goToNextRequired(instance),
  },
];

NutrientViewer.load({
  ...baseOptions,
  theme: NutrientViewer.Theme.DARK,
  toolbarItems: [...navigationItems, ...NutrientViewer.defaultToolbarItems],
}).then(async (_instance: Instance) => {
  instance = _instance;

  // Demo setup: no field in basic.pdf is required, so mark a few as required.
  const demoFieldNames = [
    "First name 2",
    "Last name 2",
    "Likes forms",
    "Multiline 2",
  ];
  const formFields = await instance.getFormFields();
  await instance.update(
    formFields
      .filter((field) => demoFieldNames.includes(field.name))
      .map((field) => field.set("required", true))
      .toArray(),
  );

  requiredWidgets = await collectRequiredWidgets(instance);
});
