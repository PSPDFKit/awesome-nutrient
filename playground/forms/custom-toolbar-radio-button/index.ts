import type { Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let instance: Instance | null = null;

const item = {
  type: "custom",
  id: "add-radio-group",
  title: "Add Radio Group",
  onPress: async () => {
    if (!instance) return;

    const radioWidget1 = new window.NutrientViewer.Annotations.WidgetAnnotation(
      {
        id: window.NutrientViewer.generateInstantId(),
        pageIndex: 0,
        formFieldName: "MyFormField",
        boundingBox: new window.NutrientViewer.Geometry.Rect({
          left: 100,
          top: 100,
          width: 20,
          height: 20,
        }),
      },
    );
    const radioWidget2 = new window.NutrientViewer.Annotations.WidgetAnnotation(
      {
        id: window.NutrientViewer.generateInstantId(),
        pageIndex: 0,
        formFieldName: "MyFormField",
        boundingBox: new window.NutrientViewer.Geometry.Rect({
          left: 130,
          top: 100,
          width: 20,
          height: 20,
        }),
      },
    );
    const formField = new window.NutrientViewer.FormFields.RadioButtonFormField(
      {
        name: "MyFormField",
        annotationIds: new window.NutrientViewer.Immutable.List([
          radioWidget1.id,
          radioWidget2.id,
        ]),
        options: new window.NutrientViewer.Immutable.List([
          new window.NutrientViewer.FormOption({
            label: "Option 1",
            value: "1",
          }),
          new window.NutrientViewer.FormOption({
            label: "Option 2",
            value: "2",
          }),
        ]),
        defaultValue: "1",
      },
    );
    await instance.create([radioWidget1, radioWidget2, formField]);
  },
};

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "form-creator" },
  ],
}).then((_instance: Instance) => {
  instance = _instance;
  instance.setToolbarItems((items) => [...items, item]);
});
