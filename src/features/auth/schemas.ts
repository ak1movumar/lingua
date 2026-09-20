import { z } from 'zod';
import type { Messages } from '@/i18n/messages/ru';
export function loginSchema(t: Messages['auth']) {
  return z.object({
    email: z.email(t.emailError),
    password: z.string().min(1, t.passwordRequired),
  });
}
export function registerSchema(t: Messages['auth']) {
  return z.object({
    email: z.email(t.emailError),
    username: z.string().min(3, t.usernameError).max(50, t.usernameError),
    password: z.string().min(8, t.passwordError).max(100, t.passwordError),
  });
}
