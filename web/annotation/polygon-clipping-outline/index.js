/**
 * Polygon Clipping Outline for Text Markup Annotations
 *
 * This example demonstrates how to create custom SVG polygon outlines
 * for text markup annotations (highlights, underlines, strikeouts, squiggles)
 * instead of using the default rectangular selection outline.
 *
 * Uses the polygon-clipping library to merge overlapping rectangles
 * into a single unified polygon outline.
 */

const PSPDFKit = window.PSPDFKit;
const polygonClipping = window.polygonClipping;

const baseUrl = "https://cdn.cloud.pspdfkit.com/pspdfkit-web@1.9.1/";

let _instance = null;

/**
 * Generates an SVG element with polygon outlines for a text markup annotation.
 *
 * @param {Object} annotation - The text markup annotation
 * @param {Object} options - Configuration options
 * @param {number} options.padding - Padding around the annotation rects (default: 3)
 * @param {number} options.lineWidth - Stroke width of the outline (default: 2)
 * @returns {SVGSVGElement} The generated SVG element
 */
function generateSvgOutline(annotation, options = {}) {
  const { padding = 0, lineWidth = 2 } = options;
  const doublePadding = padding * 2;
  const halfLineWidth = lineWidth / 2;

  // Grow each rect by the padding amount
  const rects = annotation.rects.map((r) => r.grow(padding));

  // Merge rects that are on the same line
  const lineRects = [];
  let mergedRect = rects.get(0);

  for (let i = 1; i < rects.size; i++) {
    const candidateRect = rects.get(i);
    // Tolerance for vertical alignment - adjust based on font size if needed
    if (
      PSPDFKit.Geometry.Rect.areVerticallyAligned(mergedRect, candidateRect, 6)
    ) {
      mergedRect = PSPDFKit.Geometry.Rect.union(
        PSPDFKit.Immutable.List([mergedRect, candidateRect]),
      );
    } else {
      lineRects.push(mergedRect);
      mergedRect = candidateRect;
    }
  }
  lineRects.push(mergedRect);

  // Calculate the viewBox based on the annotation's bounding box
  const viewBox = new PSPDFKit.Geometry.Rect({
    left: annotation.boundingBox.left - padding,
    top: annotation.boundingBox.top - padding,
    width: annotation.boundingBox.width + doublePadding,
    height: annotation.boundingBox.height + doublePadding,
  });

  // Clamp values to avoid stroke being clipped at edges
  const minX = viewBox.left + halfLineWidth;
  const maxX = viewBox.right - halfLineWidth;
  const minY = viewBox.top + halfLineWidth;
  const maxY = viewBox.bottom - halfLineWidth;
  const clampX = (value) => Math.max(minX, Math.min(maxX, value));
  const clampY = (value) => Math.max(minY, Math.min(maxY, value));

  // Convert rects to polygons, adjusting for gaps between lines
  const polygons = lineRects.map((curr, i) => {
    const prev = lineRects[i - 1];
    const next = lineRects[i + 1];

    let top = clampY(curr.top);
    let bottom = clampY(curr.bottom);
    const left = clampX(curr.left);
    const right = clampX(curr.right);

    // Check for vertical overlap with adjacent lines
    const hasVerticalOverlapPrev =
      prev &&
      prev.bottom < curr.top &&
      (prev.left < curr.right || prev.right > curr.left);
    const hasVerticalOverlapNext =
      next &&
      next.top > curr.bottom &&
      (next.left < curr.right || next.right > curr.left);

    // Extend rects to fill gaps between lines
    if (hasVerticalOverlapPrev) top -= Math.abs(curr.top - prev.bottom) / 2;
    if (hasVerticalOverlapNext) bottom += Math.abs(curr.bottom - next.top) / 2;

    // Return polygon in the format expected by polygon-clipping
    return [
      [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
        [left, top], // Close the polygon
      ],
    ];
  });

  // Use polygon-clipping to create a unified outline
  const contours = polygonClipping.union(polygons);

  // Create SVG element
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(SVG_NS, "svg");

  if (!contours.length) return svg;

  svg.setAttribute(
    "viewBox",
    `${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`,
  );
  svg.setAttribute("width", viewBox.width.toString());
  svg.setAttribute("height", viewBox.height.toString());
  svg.setAttribute("xmlns", SVG_NS);

  // Create path elements for each contour
  for (const polygon of contours) {
    for (const ring of polygon) {
      if (ring.length === 0) continue;

      // Generate SVG path data: M=move to, L=line to, Z=close path
      const pathData = `${ring
        .map((point, i) => `${i === 0 ? "M" : "L"} ${point[0]},${point[1]}`)
        .join(" ")} Z`;

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor"); // Allows color change via CSS
      path.setAttribute("stroke-width", lineWidth.toString());
      path.setAttribute("stroke-linejoin", "bevel"); // Less sharp corners
      svg.appendChild(path);
    }
  }

  return svg;
}

/**
 * Checks if an annotation is a text markup annotation type.
 */
function isTextMarkupAnnotation(annotation) {
  return (
    annotation instanceof PSPDFKit.Annotations.HighlightAnnotation ||
    annotation instanceof PSPDFKit.Annotations.StrikeOutAnnotation ||
    annotation instanceof PSPDFKit.Annotations.UnderlineAnnotation ||
    annotation instanceof PSPDFKit.Annotations.SquiggleAnnotation
  );
}

// Load PSPDFKit with custom renderer
PSPDFKit.load({
  baseUrl,
  container: "#pspdfkit",
  document: "document.pdf",
  customRenderers: {
    Annotation: ({ annotation }) => {
      // Only apply custom outline to selected text markup annotations
      const isSelected = _instance
        ?.getSelectedAnnotations()
        ?.some((a) => a.id === annotation.id);

      if (isSelected && isTextMarkupAnnotation(annotation)) {
        const padding = 3;
        const node = generateSvgOutline(annotation, {
          padding,
          lineWidth: 2,
        });

        // Position the SVG overlay
        node.style.cssText = `
          position: absolute;
          inset: -${padding}px;
          pointer-events: none;
          z-index: 500;
          color: #2278FE;
          opacity: 0.7;
        `;

        return { node, append: true };
      }
    },
  },
})
  .then((instance) => {
    _instance = instance;

    // Create some sample highlight annotations if document doesn't have any
    instance.getAnnotations(0).then((annotations) => {
      const hasHighlights = annotations.some((a) => isTextMarkupAnnotation(a));

      if (!hasHighlights) {
        console.log(
          "Tip: Select some text and use the highlight tool to create annotations, then click on them to see the custom outline.",
        );
      }
    });

    console.log("PSPDFKit loaded!");
    console.log(
      "Select a text markup annotation (highlight, underline, strikeout, squiggle) to see the custom polygon outline.",
    );
  })
  .catch((error) => {
    console.error("Failed to load PSPDFKit:", error.message);
  });
