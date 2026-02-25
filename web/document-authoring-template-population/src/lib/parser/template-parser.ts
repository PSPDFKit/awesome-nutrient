import {
  type DelimiterConfig,
  type ParsedPlaceholder,
  PlaceholderType,
} from "../types";
import { validatePlaceholderName } from "../utils/validator-util";

/**
 * Parses template syntax to identify placeholders
 */
export class TemplateParser {
  private delimiter: DelimiterConfig;

  constructor(delimiter: DelimiterConfig) {
    this.delimiter = delimiter;
  }

  /**
   * Find all placeholders in a text string
   */
  findPlaceholders(text: string): ParsedPlaceholder[] {
    const placeholders: ParsedPlaceholder[] = [];
    const { start, end } = this.delimiter;

    let searchIndex = 0;
    while (searchIndex < text.length) {
      const startIndex = text.indexOf(start, searchIndex);
      if (startIndex === -1) break;

      const endIndex = text.indexOf(end, startIndex + start.length);
      if (endIndex === -1) break;

      const fullMatch = text.substring(startIndex, endIndex + end.length);
      const content = text
        .substring(startIndex + start.length, endIndex)
        .trim();

      const parsed = this.parsePlaceholder(
        content,
        fullMatch,
        startIndex,
        endIndex + end.length,
      );
      if (parsed) {
        placeholders.push(parsed);
      }

      searchIndex = endIndex + end.length;
    }

    return placeholders;
  }

  /**
   * Parse a single placeholder content to determine its type and key
   */
  private parsePlaceholder(
    content: string,
    fullMatch: string,
    startIndex: number,
    endIndex: number,
  ): ParsedPlaceholder | null {
    if (content.length === 0) {
      return null;
    }

    // Loop open: {{#arrayName}}
    if (content.startsWith("#")) {
      const key = content.substring(1).trim();
      validatePlaceholderName(key);
      return {
        type: PlaceholderType.LOOP_OPEN,
        key,
        fullMatch,
        startIndex,
        endIndex,
      };
    }

    // Loop close or conditional close: {{/name}}
    if (content.startsWith("/")) {
      const key = content.substring(1).trim();
      validatePlaceholderName(key);
      return {
        type: PlaceholderType.LOOP_CLOSE,
        key,
        fullMatch,
        startIndex,
        endIndex,
      };
    }

    // Negated conditional: {{^condition}}
    if (content.startsWith("^")) {
      const key = content.substring(1).trim();
      validatePlaceholderName(key);
      return {
        type: PlaceholderType.NEGATED,
        key,
        fullMatch,
        startIndex,
        endIndex,
      };
    }

    // Simple variable or conditional: {{variable}} or {{#condition}}
    // We'll treat all # without array context as conditionals
    validatePlaceholderName(content);
    return {
      type: PlaceholderType.SIMPLE,
      key: content,
      fullMatch,
      startIndex,
      endIndex,
    };
  }

  /**
   * Determine if a placeholder with # prefix is a loop or conditional
   * This requires knowing if the data is an array or not
   */
  classifyHashPlaceholder(_key: string, data: any): PlaceholderType {
    return Array.isArray(data)
      ? PlaceholderType.LOOP_OPEN
      : PlaceholderType.CONDITIONAL;
  }
}
