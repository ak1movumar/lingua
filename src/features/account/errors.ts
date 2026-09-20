import axios from 'axios';
import { ZodError } from 'zod';
import type { Messages } from '@/i18n/messages/ru';
export function accountError(error: unknown, t: Messages['account']) {
  if (error instanceof ZodError) return t.contractError;
  if (axios.isAxiosError(error)) {
    if (!error.response) return t.networkError;
    switch (error.response.status) {
      case 400:
      case 422:
        return t.validationError;
      case 401:
      case 403:
        return t.accessError;
      case 409:
        return t.conflictError;
      case 429:
        return t.rateError;
    }
  }
  return t.serverError;
}
