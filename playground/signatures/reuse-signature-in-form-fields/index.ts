import type {
  FormField,
  InkAnnotation,
  WidgetAnnotation,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

interface Size {
  width: number;
  height: number;
}

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then(async (instance) => {
  let storedSignature: InkAnnotation | null = null;

  const formFields = await instance.getFormFields();

  instance.addEventListener("annotations.create", (annotations) => {
    const annotation = annotations.first();
    if (!annotation) return;

    if (
      annotation instanceof window.NutrientViewer.Annotations.InkAnnotation &&
      annotation.isSignature
    ) {
      storedSignature = annotation;
    }
  });

  instance.addEventListener("annotations.press", (event) => {
    const widget = event.annotation as WidgetAnnotation;
    const { id } = widget;

    const isWidgetSignature = formFields.some((form: FormField) => {
      if (
        form instanceof window.NutrientViewer.FormFields.SignatureFormField &&
        form.annotationIds.includes(id)
      ) {
        return true;
      }
      return false;
    });

    if (!storedSignature || !isWidgetSignature) return;

    event.preventDefault?.();
    instance.create(translateInkAnnotation(storedSignature, widget));
  });

  function translateInkAnnotation(
    annotation: InkAnnotation,
    widget: WidgetAnnotation,
  ) {
    const newSize = fitIn(
      {
        width: annotation.boundingBox.width,
        height: annotation.boundingBox.height,
      },
      {
        width: widget.boundingBox.width,
        height: widget.boundingBox.height,
      },
    );

    const newLeft =
      widget.boundingBox.left +
      widget.boundingBox.width / 2 -
      newSize.width / 2;
    const newTop =
      widget.boundingBox.top +
      widget.boundingBox.height / 2 -
      newSize.height / 2;

    const newBoundingBox = new window.NutrientViewer.Geometry.Rect({
      left: newLeft,
      top: newTop,
      width: newSize.width,
      height: newSize.height,
    });

    return annotation
      .set("id", window.NutrientViewer.generateInstantId())
      .set("pageIndex", widget.pageIndex)
      .set("boundingBox", newBoundingBox);
  }

  function fitIn(size: Size, containerSize: Size): Size {
    const { width, height } = size;

    const widthRatio = containerSize.width / width;
    const heightRatio = containerSize.height / height;

    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: width * ratio,
      height: height * ratio,
    };
  }
});
