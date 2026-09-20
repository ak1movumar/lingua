import axios from 'axios';
export type ApiFailure = {
  kind:
    | 'network'
    | 'unauthorized'
    | 'forbidden'
    | 'validation'
    | 'server'
    | 'unknown';
  status?: number;
  details?: unknown;
};
export function getApiFailure(error: unknown): ApiFailure {
  if (!axios.isAxiosError<unknown>(error)) return { kind: 'unknown' };
  if (!error.response) return { kind: 'network' };
  const { status, data } = error.response;
  const kind =
    status === 401
      ? 'unauthorized'
      : status === 403
        ? 'forbidden'
        : status === 422
          ? 'validation'
          : status >= 500
            ? 'server'
            : 'unknown';
  return { kind, status, details: data };
}
