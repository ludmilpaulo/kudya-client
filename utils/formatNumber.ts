/** Coerce API decimal/string values before numeric formatting. */
export function toNumber(value: number | string | null | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatRating(value: number | string | null | undefined, digits = 1): string {
  return toNumber(value).toFixed(digits);
}
