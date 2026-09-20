import { z } from 'zod';
import type { components } from '@/types/api.generated';
export type LoginInput = components['schemas']['LoginSchema'];
export type RegisterInput = components['schemas']['RegisterSchema'];
export type User = components['schemas']['UserResponseSchema'];
export const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.string().optional(),
});
/** Refresh has no response schema in Swagger. Accept only declared token field names,
 * validate at runtime and retain the existing refresh token if no rotation is returned. */
export const refreshResponseSchema = tokenSchema.partial({
  refresh_token: true,
});
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  username: z.string(),
  role: z.enum(['user', 'admin']),
  is_active: z.boolean(),
  created_at: z.string(),
}) satisfies z.ZodType<User>;
export class AuthContractError extends Error {
  constructor() {
    super('Unexpected authentication response');
    this.name = 'AuthContractError';
  }
}
