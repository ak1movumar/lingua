import { api } from '@/services/api/client';
import { userSchema } from '@/features/auth/contracts';
import type { components } from '@/types/api.generated';
export async function updateAccount(
  input: components['schemas']['UserUpdateSchema'],
  expectedId: string,
) {
  const user = userSchema.parse(
    (await api.put<unknown>('/users/me', input)).data,
  );
  if (user.id !== expectedId) throw new Error('Account identity mismatch');
  return user;
}
export async function deleteAccount() {
  await api.delete('/users/me');
}
