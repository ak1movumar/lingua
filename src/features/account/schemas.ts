import { z } from 'zod';
import type { Messages } from '@/i18n/messages/ru';
import type { components } from '@/types/api.generated';
export const profileSchema = (t: Messages['account']) =>
  z.object({
    username: z.string().refine((value) => value.trim().length > 0, t.required),
    email: z.email(t.emailInvalid),
  });
export const passwordSchema = (t: Messages['account']) =>
  z
    .object({
      password: z.string().min(1, t.required),
      confirmation: z.string().min(1, t.required),
    })
    .refine((value) => value.password === value.confirmation, {
      path: ['confirmation'],
      message: t.passwordMismatch,
    });
export type ProfileValues = z.infer<ReturnType<typeof profileSchema>>;
export type PasswordValues = z.infer<ReturnType<typeof passwordSchema>>;
export function profileChanges(
  original: ProfileValues,
  values: ProfileValues,
): components['schemas']['UserUpdateSchema'] {
  const changes: components['schemas']['UserUpdateSchema'] = {};
  if (original.username !== values.username) changes.username = values.username;
  if (original.email !== values.email) changes.email = values.email;
  return changes;
}
export function passwordChanges(
  values: PasswordValues,
): components['schemas']['UserUpdateSchema'] {
  return { password: values.password };
}
