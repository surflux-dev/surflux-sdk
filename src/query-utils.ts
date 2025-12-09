/**
 * Builds query parameters object from an input object, filtering out undefined and null values
 */
export function buildQueryParams<T extends Record<string, unknown>>(params: T): Record<string, unknown> {
  const queryParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParams[key] = value;
    }
  }
  return queryParams;
}
