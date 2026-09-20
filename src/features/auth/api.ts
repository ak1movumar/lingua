import { api, publicApi } from '@/services/api/client';
import {
  AuthContractError,
  tokenSchema,
  userSchema,
  type LoginInput,
  type RegisterInput,
} from './contracts';
export async function login(input: LoginInput) {
  const response = await publicApi.post<unknown>('/auth/login', input);
  const result = tokenSchema.safeParse(response.data);
  if (
    !result.success ||
    (result.data.token_type &&
      result.data.token_type.toLowerCase() !== 'bearer')
  )
    throw new AuthContractError();
  return result.data;
}
export async function register(input: RegisterInput) {
  const response = await publicApi.post<unknown>('/auth/register', input);
  const parsed = userSchema.safeParse(response.data);
  if (!parsed.success) throw new AuthContractError();
  return parsed.data;
}
export async function getMe(signal?: AbortSignal) {
  const response = await api.get<unknown>('/users/me', { signal });
  return userSchema.parse(response.data);
}
export async function logout(refreshToken: string) {
  await publicApi.post('/auth/logout', { refresh_token: refreshToken });
}
