/**
 * Validates placeholder names according to Web SDK rules:
 * - Only letters, numbers, and underscores
 * - No hyphens, dots, special characters, or spaces
 */

const VALID_PLACEHOLDER_PATTERN = /^[a-zA-Z0-9_]+$/;

/**
 * Check if a placeholder name is valid
 */
export function isValidPlaceholderName(name: string): boolean {
  return VALID_PLACEHOLDER_PATTERN.test(name);
}

/**
 * Validate and throw if invalid
 */
export function validatePlaceholderName(name: string): void {
  if (!isValidPlaceholderName(name)) {
    throw new Error(
      `Invalid placeholder name: "${name}". ` +
        "Placeholders must contain only letters, numbers, and underscores.",
    );
  }
}
