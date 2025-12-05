import type { Instance, PageInfo } from "@nutrient-sdk/viewer";

const baseOptions = {
  container: ".nutrient-viewer",
  document: "document.pdf",
};

window.NutrientViewer.load({
  ...baseOptions,
  disableTextSelection: true,
})
  .then(async (instance: Instance) => {
    const pageInfos = await Promise.all(
      Array.from({ length: instance.totalPageCount }).map((_, pageIndex) =>
        instance.pageInfoForIndex(pageIndex),
      ),
    );

    const watermarks = pageInfos
      .filter((pageInfo): pageInfo is PageInfo => pageInfo !== null)
      .reduce<
        Array<
          InstanceType<typeof window.NutrientViewer.Annotations.TextAnnotation>
        >
      >((acc, pageInfo) => {
        const { index: pageIndex, rawPdfBoxes } = pageInfo;
        const { cropBox } = rawPdfBoxes;

        if (!cropBox) {
          return acc;
        }

        const [left, top, width, height] = cropBox;

        const totalRows = 4; // 4 rows
        const totalCols = 3; // 3 columns
        const text = "CONFIDENTIAL";
        const fontSize = 14;
        const textWidth = width * 0.4; // Increased width (40% of page width)
        const textHeight = 50; // Increased height for better visibility

        for (let row = 0; row < totalRows; row++) {
          for (let col = 0; col < totalCols; col++) {
            const x = (col + 1) * (width / (totalCols + 1));
            const y = (row + 1) * (height / (totalRows + 1));

            acc.push(
              new window.NutrientViewer.Annotations.TextAnnotation({
                pageIndex: pageIndex,
                text: { format: "plain", value: text },
                fontSize: fontSize,
                isBold: true,
                font: "Helvetica",
                horizontalAlign: "center",
                boundingBox: new window.NutrientViewer.Geometry.Rect({
                  left: x - textWidth / 2, // Center horizontally
                  top: y - textHeight / 2, // Center vertically
                  width: textWidth + 100, // Increased width
                  height: textHeight + 100, // Increased height
                }),
                fontColor: window.NutrientViewer.Color.GREY,
                rotation: 30, // Slight tilt
                readOnly: true,
                opacity: 0.2, // Transparent watermark
              }),
            );
          }
        }
        return acc;
      }, []);

    await instance.create(watermarks);
    await instance.applyOperations([{ type: "flattenAnnotations" }]); // Optional: Flatten watermarks
  })
  .catch((error: Error) => {
    console.error(error.message);
  });
