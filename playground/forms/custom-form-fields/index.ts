import type {
  FormField,
  Instance,
  ViewState,
  WidgetAnnotation,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

const updateInteractive = (instance: Instance): void => {
  instance.setViewState((viewState: ViewState) =>
    viewState.set(
      "interactionMode",
      window.NutrientViewer.InteractionMode.FORM_CREATOR,
    ),
  );
  instance.setViewState((viewState: ViewState) =>
    viewState.set(
      "interactionMode",
      window.NutrientViewer.InteractionMode.TEXT_WIDGET,
    ),
  );
};

let buttonName: "name" | "email";

const fields = {
  name: { name: "customer_name", value: "Customer name field" },
  email: { name: "customer_email", value: "Customer email field" },
};

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  onWidgetAnnotationCreationStart: (
    annotation: WidgetAnnotation,
    formField: FormField,
  ) => {
    const randomStr = window.NutrientViewer.generateInstantId();
    return {
      annotation: annotation
        .set("formFieldName", `${fields[buttonName].name}-${randomStr}`)
        .set("customData", { customerField: true }),
      formField: formField
        .set("name", `${fields[buttonName].name}-${randomStr}`)
        .set("value", fields[buttonName].value),
    };
  },
}).then((instance: Instance) => {
  instance.setToolbarItems([
    { type: "spacer" },
    {
      type: "custom",
      id: "name",
      title: "Customer Name",
      onPress: () => {
        buttonName = "name";
        updateInteractive(instance);
      },
    },
    {
      type: "custom",
      id: "email",
      title: "Customer Email",
      onPress: () => {
        buttonName = "email";
        updateInteractive(instance);
      },
    },
    {
      type: "form-creator",
    },
  ]);
});
