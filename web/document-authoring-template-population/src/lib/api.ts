import { DocumentTemplating } from "./DocumentTemplating";
import type { ApplyTemplateOptions, TemplateData } from "./types";

/**
 * Convenience function to apply template data to a Document Authoring instance
 *
 * @example
 * ```typescript
 * import { applyTemplateData } from '@nutrient/doc-authoring-templating';
 *
 * const instance = await NutrientDocumentAuthoring.load({
 *   container: '#editor',
 *   document: 'template.docx'
 * });
 *
 * await applyTemplateData(instance, {
 *   config: {
 *     delimiter: { start: '{{', end: '}}' }
 *   },
 *   model: {
 *     name: 'John Doe',
 *     items: [{ product: 'Item 1' }]
 *   }
 * });
 * ```
 */
export async function applyTemplateData(
  instance: any,
  data: TemplateData,
  options?: ApplyTemplateOptions,
): Promise<void> {
  return DocumentTemplating.applyTemplateData(instance, data, options);
}
