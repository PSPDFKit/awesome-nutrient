import "./assets/pspdfkit.js";

// We need to inform PSPDFKit where to look for its library assets, i.e. the location of the `pspdfkit-lib` directory.
const baseUrl = `${window.location.protocol}//${window.location.host}/assets/`;

PSPDFKit.load({
  baseUrl,
  container: "#pspdfkit",
  document:
    "https://pj-document-bucket.s3.ca-central-1.amazonaws.com/The+Magnificent+Agreement+Regarding+the+History+of+the+Portable+Document+Format.pdf",
}).then(async (instance) => {
  // Create and append the "Sign Here" widget to the document.
  const signHereWidget = document.createElement("div");
  signHereWidget.innerHTML = '\n<svg viewBox="193.583 215.541 113.747 40.714" width="113.747" height="40.714">\n  <path d="M 193.709 216.256 H 287.206 L 287.206 216.256 L 307.206 236.256 L 287.206 256.256 L 287.206 256.256 H 193.709 V 216.256 Z" data-bx-shape="arrow 193.709 216.256 113.497 40 40 20 0 1@f3ec9ecd" style="fill: rgb(90, 120, 255); stroke: rgb(255, 255, 255); stroke-opacity: 0;" transform="matrix(0.99998, -0.0063, 0.0063, 0.99998, -1.484668, 1.225137)"></path>\n  <text style="fill: rgb(254, 254, 254); font-family: Arial, sans-serif; font-size: 19.1px; stroke-opacity: 0; white-space: pre;" x="201.663" y="242.006">Sign Here</text>\n</svg>\n';
  signHereWidget.style.position = "absolute";
  instance.contentDocument
    .querySelector(`.PSPDFKit-Spread[data-spread-index="0"]`)
    .appendChild(signHereWidget);

  // Define a helper function to check if one box is within another.
  const updateSignHereWidget = async () => {
    const widgetAnnotations = (
        await Promise.all(
          Array.from({ length: instance.totalPageCount }).map((_, pageIndex) =>
            instance
              .getAnnotations(pageIndex)
              .then((annotations) =>
                annotations.filter(
                  (annotation) =>
                    annotation instanceof PSPDFKit.Annotations.WidgetAnnotation
                )
              )
          )
        )
      )
        .flat()
        .flatMap((annotation) =>
          annotation._tail ? annotation._tail.array : []
        ),
      signatures = (
        await Promise.all(
          Array.from({ length: instance.totalPageCount }).map((_, pageIndex) =>
            instance
              .getAnnotations(pageIndex)
              .then((annotations) =>
                annotations.filter((annotation) => annotation.isSignature)
              )
          )
        )
      )
        .flat()
        .flatMap((signature) => (signature._tail ? signature._tail.array : []));

    // Flatten widgetAnnotationsUnFlattened to a single dimensional array
    // Move the "Sign Here" widget.
    let firstWidget = widgetAnnotations.filter((annotation) => {
      let signatureSet = false;
      return (
        signatures.length > 0 &&
          (signatureSet = signatures.some((signature) => {
            const box1 = signature.boundingBox;
            const box2 = annotation.boundingBox;
            return (
              box1.left >= box2.left &&
              box1.top >= box2.top &&
              box1.left + box1.width <= box2.left + box2.width &&
              box1.top + box1.height <= box2.top + box2.height
            );
          })),
        !signatureSet
      );
    })[0];

    if (firstWidget) {
      const element = instance.contentDocument.querySelector(
        `.PSPDFKit-Annotation[data-annotation-id="${firstWidget.id}"]`
      );
      const state = instance.viewState;
      // Switch to the page of the current signature widget.
      instance.setViewState(
        state.set("currentPageIndex", firstWidget.pageIndex)
      );
      const spreadElement = instance.contentDocument.querySelector(
        `.PSPDFKit-Spread[data-spread-index="${firstWidget.pageIndex}"]`
      );

      // Remove the widget from its current parent if it has one
      if (signHereWidget.parentNode) {
        signHereWidget.parentNode.removeChild(signHereWidget);
      }

      spreadElement.appendChild(signHereWidget);

      const position = element.getBoundingClientRect();
      signHereWidget.style.top = position.top - 66 + "px";
      signHereWidget.style.position = "absolute";
      signHereWidget.style.left = `${-116}px`; 
      signHereWidget.style.display = "block";
    } else if (signHereWidget.style.display === "block") {
      alert("Thank you for signing the document, you are now a PDF Expert!");
      signHereWidget.style.display = "none";
    }
  };

  // Update the "Sign Here" widget whenever the user scrolls.
  // instance.contentDocument
  //   .querySelector(".PSPDFKit-Scroll")
  //   .addEventListener("scroll", updateSignHereWidget);

  // Update the "Sign Here" widget when someone signs
  instance.addEventListener("annotations.change", () => {
    updateSignHereWidget();
  });

  // Update widget with delay to make it visually pop
  window.setTimeout(updateSignHereWidget, 1000);
});
