# Polygon Clipping Outline for Text Markup Annotations

Demonstrates how to create custom SVG polygon outlines for text markup annotations (highlights, underlines, strikeouts, squiggles) instead of using the default rectangular selection outline.

## Why Use This?

The default selection outline for text markup annotations is a simple rectangle around the bounding box. When you have multiple annotations in the same color close to each other, this can be imprecise. This example generates a unified polygon outline that precisely follows the shape of each annotation's rects.

## Features

- **Precise outlines**: Generates SVG paths that follow the exact shape of text markup annotations
- **Polygon union**: Uses `polygon-clipping` library to merge overlapping rectangles into a single outline
- **Custom renderer**: Implements using Nutrient Web SDK's `customRenderers.Annotation` API
- **Configurable styling**: Adjustable padding, line width, and color

## How It Works

1. When a text markup annotation is selected, the custom renderer kicks in
2. The annotation's `rects` are processed to merge vertically-aligned rectangles
3. The `polygon-clipping` library creates a unified polygon from all rects
4. An SVG path is generated and positioned as an overlay

## Quick Start

```bash
cd polygon-clipping-outline
npm install
npm start
```

Then open `http://localhost:8080` in your browser.

## Key Dependencies

- [polygon-clipping](https://www.npmjs.com/package/polygon-clipping) - Library for polygon boolean operations (union, intersection, etc.)

## Code Highlights

### Custom Renderer Setup

```javascript
customRenderers: {
  Annotation: ({ annotation }) => {
    const isSelected = instance?.getSelectedAnnotations()?.some(a => a.id === annotation.id);
    const isTextMarkup = annotation instanceof NutrientViewer.Annotations.HighlightAnnotation ||
                         annotation instanceof NutrientViewer.Annotations.StrikeOutAnnotation ||
                         annotation instanceof NutrientViewer.Annotations.UnderlineAnnotation ||
                         annotation instanceof NutrientViewer.Annotations.SquiggleAnnotation;

    if (isSelected && isTextMarkup) {
      const node = generateSvgOutline(annotation, { padding: 3, lineWidth: 2 });
      node.style.cssText = `position: absolute; inset: -3px; pointer-events: none; z-index: 500; color: #2278FE; opacity: 0.7;`;
      return { node, append: true };
    }
  }
}
```

### Hide Default Outline (CSS)

```css
.PSPDFKit-Highlight-Annotation.PSPDFKit-Text-Markup-Annotation-selected {
  outline: none !important;
  border: none !important;
}
```

## Customization Options

| Option | Default | Description |
|--------|---------|-------------|
| `padding` | 3 | Pixels of padding around the annotation rects |
| `lineWidth` | 2 | Stroke width of the outline |
| `color` | #2278FE | Outline color (via CSS `currentColor`) |
| `opacity` | 0.7 | Outline opacity |

## Performance Considerations

The SVG is regenerated on every render. For better performance with many annotations, consider caching the generated SVGs in a `Map<AnnotationId, SVGSVGElement>`.

## Alternative Approach

You could also implement this using [custom overlay items](https://www.nutrient.io/guides/web/customizing-the-interface/creating-custom-overlay-items/) instead of custom renderers.

## Credits

This example is based on a solution shared by a Nutrient customer who needed more precise selection outlines for documents with multiple annotations in close proximity.

## Related

- [Nutrient Web SDK Documentation](https://www.nutrient.io/guides/web/)
- [Custom Renderers Guide](https://www.nutrient.io/guides/web/annotations/custom-rendered-annotations/)
- [polygon-clipping on npm](https://www.npmjs.com/package/polygon-clipping)
