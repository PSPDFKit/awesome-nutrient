/**
 * Resolves data from the model
 */

/**
 * Get a value from the model by key
 * Returns undefined if not found
 */
export function resolve(model: Record<string, any>, key: string): any {
  return model[key];
}

/**
 * Check if a value is truthy for conditional evaluation
 */
export function isTruthy(value: any): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Check if a value is an array (for loop processing)
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}
