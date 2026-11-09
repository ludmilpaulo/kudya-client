export type ApiErrorInfo = {
  status: number | null;
  detail: string | null;
  retryIn: number | null;
  attemptsLeft: number | null;
};

/** Pulls status + the fields the auth endpoints return ({detail, retry_in, attempts_left}). */
export function apiErrorInfo(error: unknown): ApiErrorInfo {
  const response =
    error && typeof error === 'object' ? (error as { response?: { status?: unknown; data?: unknown } }).response : undefined;
  const data = response?.data && typeof response.data === 'object' ? (response.data as Record<string, unknown>) : {};
  const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
  return {
    status: num(response?.status),
    detail: typeof data.detail === 'string' ? data.detail : null,
    retryIn: num(data.retry_in),
    attemptsLeft: num(data.attempts_left),
  };
}
