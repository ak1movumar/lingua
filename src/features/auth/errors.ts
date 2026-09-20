import axios from 'axios';
import { ZodError } from 'zod';
import type { Messages } from '@/i18n/messages/ru';
import { AuthContractError } from './contracts';
export function authErrorMessage(error: unknown, t: Messages['auth']) {
  if (error instanceof AuthContractError || error instanceof ZodError)
    return t.contractError;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!status) return t.networkError;
    if (status === 401) return t.invalidCredentials;
    if (status === 403) return t.forbidden;
    if (status === 409) return t.accountExists;
    if (status === 422 || status === 400) return t.validationError;
    if (status === 429) return t.rateLimited;
  }
  return t.serverError;
}
