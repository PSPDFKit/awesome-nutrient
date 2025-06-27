interface JsonData {
  config?: unknown;
  model: Record<string, unknown>;
}

export function transformJsonToReadable(jsonData: JsonData): string {
  // Ignore config object, process only model
  if (!jsonData.model) {
    return 'No model data found';
  }

  const result: string[] = [];
  processObject(jsonData.model, result, 0);
  return result.join('\n');
}

function processObject(
  obj: Record<string, unknown>,
  result: string[],
  indentLevel: number
): void {
  const indent = '    '.repeat(indentLevel); // 4 spaces per level

  for (const [key, value] of Object.entries(obj)) {
    const titleCaseKey = toTitleCase(key);

    if (value === null || value === undefined) {
      result.push(`${indent}• ${titleCaseKey}: ${value}`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result.push(`${indent}• ${titleCaseKey}: []`);
      } else {
        result.push(`${indent}▼ ${titleCaseKey}:`);
        processArray(value, result, indentLevel + 1);
      }
    } else if (typeof value === 'object' && value !== null) {
      result.push(`${indent}▼ ${titleCaseKey}:`);
      processObject(value as Record<string, unknown>, result, indentLevel + 1);
    } else {
      // Simple value (string, number, boolean)
      result.push(`${indent}• ${titleCaseKey}: ${value}`);
    }
  }
}

function processArray(
  arr: unknown[],
  result: string[],
  indentLevel: number
): void {
  const indent = '    '.repeat(indentLevel);

  arr.forEach((item, index) => {
    if (item === null || item === undefined) {
      result.push(`${indent}• [${index}]: ${item}`);
    } else if (Array.isArray(item)) {
      result.push(`${indent}▼ [${index}]:`);
      processArray(item, result, indentLevel + 1);
    } else if (typeof item === 'object' && item !== null) {
      result.push(`${indent}▼ [${index}]:`);
      processObject(item as Record<string, unknown>, result, indentLevel + 1);
    } else {
      result.push(`${indent}• [${index}]: ${item}`);
    }
  });
}

function toTitleCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
