/**
 * Centralized fundSource utilities.
 *
 * REMOVAL CHECKLIST (when transitioning to string[] only):
 * 1. Set FUND_SOURCE_SUPPORTS_SINGLE_STRING = false
 * 2. In toFundSourceArray: remove the `typeof value === 'string'` branch
 * 3. In isValidFundSourceInput: remove the `typeof value === 'string'` branch
 * 4. In ppa-plan.dto.ts: change fundSource type to string[], use @IsArray() @IsString({ each: true })
 * 5. In ppa-plan.schema.ts: change to type: [String], remove Mixed
 * 6. Run DB migration to convert legacy string values to [string]
 * 7. Remove normalizeFundSourceForResponse (or simplify to identity) once all data is string[]
 */

export const FUND_SOURCE_REF_DATA_KEY = 'fundSource';

/** Set to false when ready to remove single-string support */
export const FUND_SOURCE_SUPPORTS_SINGLE_STRING = true;

/** Normalizes fundSource input to string[]. Used by validation pipe before persisting. */
export function toFundSourceArray(
  value: string | string[] | undefined | null,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v : String(v)));
  }
  if (FUND_SOURCE_SUPPORTS_SINGLE_STRING && typeof value === 'string') {
    return [value];
  }
  return undefined;
}

/** Type guard for DTO validation. Remove string branch when transitioning. */
export function isValidFundSourceInput(value: unknown): value is string | string[] {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === 'string');
  }
  if (FUND_SOURCE_SUPPORTS_SINGLE_STRING && typeof value === 'string') {
    return true;
  }
  return false;
}

/** Normalizes fundSource for API response (handles legacy string in DB). */
export function normalizeFundSourceForResponse(
  value: string | string[] | undefined | null,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return undefined;
}
