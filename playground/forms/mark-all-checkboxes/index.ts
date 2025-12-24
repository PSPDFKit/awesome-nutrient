import type { Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    { type: "form-creator" },
  ],
}).then(async (instance: Instance) => {
  const formFields = await instance.getFormFields();

  for (const formField of formFields) {
    if (
      formField instanceof window.NutrientViewer.FormFields.CheckBoxFormField
    ) {
      await instance.setFormFieldValues({
        [formField.name]: ["Yes"],
      });
    }
  }
});
