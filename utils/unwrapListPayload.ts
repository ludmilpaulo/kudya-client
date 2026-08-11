/** Normalize DRF list payloads (array or `{ results: [...] }`) and reject error bodies. */
export function unwrapListPayload<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export function assertOkJson(res: { ok: boolean; status: number }, data: unknown, fallback: string): void {
  if (res.ok) return;
  const detail =
    data && typeof data === 'object' && typeof (data as { detail?: unknown }).detail === 'string'
      ? (data as { detail: string }).detail
      : `${fallback} (${res.status})`;
  throw new Error(detail);
}
