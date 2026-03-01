import { isArray, resolve } from "../utils/data-resolver";

/**
 * Processes loop placeholders
 */
export class LoopProcessor {
  private model: Record<string, any>;

  constructor(model: Record<string, any>) {
    this.model = model;
  }

  /**
   * Get array data for a loop
   */
  getArrayData(key: string): any[] | null {
    const value = resolve(this.model, key);

    if (value === undefined || value === null) {
      return null;
    }

    if (!isArray(value)) {
      console.warn(
        `Loop placeholder {{#${key}}} expects an array but got:`,
        typeof value,
      );
      return null;
    }

    return value;
  }

  /**
   * Check if a key resolves to an array
   */
  isArrayKey(key: string): boolean {
    const value = resolve(this.model, key);
    return isArray(value);
  }
}
