import { PlaceholderType } from "../types";
import { isTruthy, resolve } from "../utils/data-resolver";

/**
 * Processes conditional placeholders
 */
export class ConditionalProcessor {
  private model: Record<string, any>;

  constructor(model: Record<string, any>) {
    this.model = model;
  }

  /**
   * Determine if a conditional should show its content
   *
   * @param key - The condition key
   * @param type - CONDITIONAL ({{#key}}) or NEGATED ({{^key}})
   */
  shouldShowContent(key: string, type: PlaceholderType): boolean {
    const value = resolve(this.model, key);
    const conditionValue = isTruthy(value);

    if (type === PlaceholderType.CONDITIONAL) {
      return conditionValue;
    }
    if (type === PlaceholderType.NEGATED) {
      return !conditionValue;
    }

    return false;
  }

  /**
   * Evaluate a condition for a given key
   */
  evaluateCondition(key: string): boolean {
    const value = resolve(this.model, key);
    return isTruthy(value);
  }
}
