/**
 * Document Authoring Templating Library
 *
 * This library provides template data population functionality for
 * Nutrient Document Authoring SDK, matching the behavior of the Web SDK's
 * populateDocumentTemplate function.
 */

export { applyTemplateData } from "./api";
export { DocumentTemplating } from "./DocumentTemplating";

export type {
  ApplyTemplateOptions,
  DelimiterConfig,
  DocumentPlaceholder,
  ParsedPlaceholder,
  PlaceholderType,
  TemplateConfig,
  TemplateData,
} from "./types";
