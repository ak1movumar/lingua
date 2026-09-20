import { getApiFailure } from '@/services/api/errors';
import { ZodError } from 'zod';
import type { friendshipMessages } from '@/i18n/friendship';
export function friendshipError(
  error: unknown,
  t: (typeof friendshipMessages)['ru'],
) {
  if (error instanceof ZodError) return t.contract;
  const failure = getApiFailure(error);
  if (failure.kind === 'network') return t.network;
  if (failure.status === 401) return t.unauthorized;
  if (failure.status === 403) return t.forbidden;
  if (failure.status === 404) return t.notFound;
  if (failure.status === 400 || failure.status === 409)
    return `${t.conflict} (HTTP ${failure.status})`;
  if (failure.status === 422) return t.invalidRequest;
  if (failure.kind === 'server') return t.server;
  return t.unknown;
}
