/**
 * Configuration for template delimiters
 */
export interface DelimiterConfig {
  start: string;
  end: string;
}

/**
 * Template configuration options
 */
export interface TemplateConfig {
  delimiter: DelimiterConfig;
  defaultValue?: string;
}

/**
 * Template data structure matching Web SDK format
 */
export interface TemplateData {
  config: TemplateConfig;
  model: Record<string, any>;
}

/**
 * Placeholder types found in templates
 */
export enum PlaceholderType {
  SIMPLE = "simple", // {{variable}}
  LOOP_OPEN = "loop_open", // {{#array}}
  LOOP_CLOSE = "loop_close", // {{/array}}
  CONDITIONAL = "conditional", // {{#condition}}
  NEGATED = "negated", // {{^condition}}
}

/**
 * Parsed placeholder information
 */
export interface ParsedPlaceholder {
  type: PlaceholderType;
  key: string; // The variable/array/condition name
  fullMatch: string; // The complete placeholder text including delimiters
  startIndex: number;
  endIndex: number;
}

/**
 * A placeholder found in the document with its location
 */
export interface DocumentPlaceholder extends ParsedPlaceholder {
  textNode: any; // Document Authoring text node reference
  paragraphId?: string;
  sectionId?: string;
}

/**
 * Options for applying template data
 */
export interface ApplyTemplateOptions {
  throwOnMissingData?: boolean;
}
