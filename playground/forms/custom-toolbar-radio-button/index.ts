import type { Instance, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let instance: Instance | null = null;

const createGroupedRadioButtons = async (instance: Instance | null) => {
  const radioWidget1 = new NutrientViewer.Annotations.WidgetAnnotation({
    id: NutrientViewer.generateInstantId(),
    pageIndex: 0,
    formFieldName: "MyFormField",
    boundingBox: new NutrientViewer.Geometry.Rect({
      left: 100,
      top: 100,
      width: 20,
      height: 20,
    }),
  });

  const radioWidget2 = new NutrientViewer.Annotations.WidgetAnnotation({
    id: NutrientViewer.generateInstantId(),
    pageIndex: 0,
    formFieldName: "MyFormField",
    boundingBox: new NutrientViewer.Geometry.Rect({
      left: 130,
      top: 100,
      width: 20,
      height: 20,
    }),
  });

  const formField = new NutrientViewer.FormFields.RadioButtonFormField({
    name: "MyFormField",
    annotationIds: new NutrientViewer.Immutable.List([
      radioWidget1.id,
      radioWidget2.id,
    ]),
    options: new NutrientViewer.Immutable.List([
      new NutrientViewer.FormOption({
        label: "Option 1",
        value: "1",
      }),
      new NutrientViewer.FormOption({
        label: "Option 2",
        value: "2",
      }),
    ]),
    defaultValue: "1",
  });

  await instance?.create([radioWidget1, radioWidget2, formField]);
};

const item: ToolbarItem = {
  type: "custom",
  id: "add-radio-group",
  title: "Add Radio Group",
  onPress: () => createGroupedRadioButtons(instance),
};

NutrientViewer.load({
  ...baseOptions,
  theme: NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...NutrientViewer.defaultToolbarItems,
    { type: "form-creator" },
  ],
}).then((_instance: Instance) => {
  instance = _instance;
  instance.setToolbarItems((items) => [...items, item]);
});
