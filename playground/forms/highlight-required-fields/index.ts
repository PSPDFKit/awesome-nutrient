import type {
  AnnotationsUnion,
  FormField,
  Instance,
  RendererConfiguration,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let requiredFormFields: ReturnType<
  typeof window.NutrientViewer.Immutable.List<FormField>
>;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  customRenderers: {
    Annotation: ({
      annotation,
    }: {
      annotation: AnnotationsUnion;
    }): RendererConfiguration | null => {
      if (
        !(
          annotation instanceof
          window.NutrientViewer.Annotations.WidgetAnnotation
        )
      ) {
        return null;
      }

      const isRequiredField =
        requiredFormFields &&
        requiredFormFields.size > 0 &&
        requiredFormFields.find(
          (formField: FormField) => formField.name === annotation.formFieldName,
        );

      if (isRequiredField) {
        const node = document.createElement("div");
        node.classList.add("required-form-field");

        return {
          node,
          append: true,
        };
      }

      return null;
    },
  },
}).then(async (instance: Instance) => {
  const formFields = await instance.getFormFields();

  const changes = formFields.map((formField: FormField) =>
    formField.set("required", true),
  );

  await instance.update(changes.toArray());

  const updatedFormFields = await instance.getFormFields();

  requiredFormFields = updatedFormFields.filter(
    (formField: FormField) => formField.required,
  );
});
