/**
 * Extracts allowed string values from reference data.
 * Handles arrays of strings, arrays of objects with value/code/id, or single string.
 */
export function allowedValuesFromRefData(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          if (typeof obj.value === 'string') return obj.value;
          if (typeof obj.code === 'string') return obj.code;
          if (typeof obj.id === 'string') return obj.id;
        }
        return null;
      })
      .filter((s): s is string => s != null);
  }
  if (typeof value === 'string') return [value];
  return [];
}
