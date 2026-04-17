import { resolve } from "../utils/data-resolver";

/**
 * Handles replacement of simple placeholders with data values
 */
export class PlaceholderReplacer {
  private model: Record<string, any>;
  private defaultValue: string;

  constructor(model: Record<string, any>, defaultValue = "") {
    this.model = model;
    this.defaultValue = defaultValue;
  }

  /**
   * Replace all placeholders in text with values from the model
   */
  replacePlaceholders(
    text: string,
    placeholderPattern: RegExp,
    extractKey: (match: string) => string,
  ): string {
    return text.replace(placeholderPattern, (match) => {
      const key = extractKey(match);
      const value = resolve(this.model, key);

      if (value === undefined || value === null) {
        return this.defaultValue;
      }

      return String(value);
    });
  }

  /**
   * Get value for a specific key
   */
  getValue(key: string): any {
    const value = DataResolver.resolve(this.model, key);
    return value !== undefined && value !== null ? value : this.defaultValue;
  }

  /**
   * Create a child replacer with context data (for use in loops)
   */
  withContext(contextData: Record<string, any>): PlaceholderReplacer {
    return new PlaceholderReplacer(contextData, this.defaultValue);
  }
}
