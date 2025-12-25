import type {
  ImageAnnotation,
  InkAnnotation,
  Instance,
  Rect,
  WidgetAnnotation,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let globalInstance: Instance | null = null;

function scrollToNextSignatureField(index: number, rect: Rect) {
  if (!globalInstance) return;

  const page = (
    globalInstance.contentDocument.getRootNode() as Document
  ).querySelector(`[data-page-index="${index}"]`);

  const arrow = document.createElement("span");
  arrow.classList.add("blob");
  arrow.style.cssText += `
    background: url(https://cdn-icons-png.flaticon.com/512/545/545682.png) 50% no-repeat;
    content: "";
    height: 1.2em;
    left: -2rem;
    position: absolute;
    top: 0;
    width: 1rem;
  `;

  const item = new window.NutrientViewer.CustomOverlayItem({
    id: "arrow",
    node: arrow,
    pageIndex: index,
    position: new window.NutrientViewer.Geometry.Point({
      x: rect.left + 15,
      y: rect.top,
    }),
  });

  globalInstance.setCustomOverlayItem(item);

  window.requestAnimationFrame(() => {
    page?.scrollIntoView({
      block: "end",
      inline: "nearest",
      behavior: "smooth",
    });
  });
}

localStorage.setItem("signature-field-counter", "0");

window.NutrientViewer.load({
  ...baseOptions,
}).then(async (instance: Instance) => {
  globalInstance = instance;

  const formFields = await instance.getFormFields();

  const signatureFormFields = formFields.filter(
    (field) =>
      field instanceof window.NutrientViewer.FormFields.SignatureFormField,
  );

  const signatureNameIds = new Set(
    signatureFormFields.map((field) => field.name),
  );

  const signatureFields = (
    await Promise.all(
      Array.from({ length: instance.totalPageCount }).map((_, pageIndex) =>
        instance.getAnnotations(pageIndex),
      ),
    )
  ).flatMap((annotations) =>
    annotations
      .filter((annotation) =>
        signatureNameIds.has(
          (annotation as WidgetAnnotation).formFieldName ?? "",
        ),
      )
      .toJS(),
  );

  setTimeout(() => {
    if (signatureFields.length > 0) {
      scrollToNextSignatureField(
        signatureFields[0].pageIndex,
        signatureFields[0].boundingBox,
      );
    }
  }, 1000);

  instance.addEventListener("annotations.willChange", (event) => {
    const { annotations, reason } = event;
    const counter = Number.parseInt(
      localStorage.getItem("signature-field-counter") ?? "0",
      10,
    );

    const firstAnnotation = annotations.first() as
      | InkAnnotation
      | ImageAnnotation
      | undefined;
    if (!firstAnnotation) return;

    if (
      firstAnnotation.isSignature &&
      reason === window.NutrientViewer.AnnotationsWillChangeReason.SELECT_END
    ) {
      instance.removeCustomOverlayItem("arrow");

      const newCounter = counter + 1;
      localStorage.setItem("signature-field-counter", newCounter.toString());

      if (newCounter < signatureFields.length) {
        const nextSignatureField = signatureFields[newCounter];
        const nextPageIndex = nextSignatureField.pageIndex;

        const onViewStateChange = () => {
          setTimeout(() => {
            scrollToNextSignatureField(
              nextSignatureField.pageIndex,
              nextSignatureField.boundingBox,
            );
          }, 100);

          instance.removeEventListener("viewState.change", onViewStateChange);
        };

        instance.addEventListener("viewState.change", onViewStateChange);

        instance.setViewState((viewState) =>
          viewState.set("currentPageIndex", nextPageIndex),
        );
      }
    }
  });
});
