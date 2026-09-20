import { z } from 'zod';
import { api } from '@/services/api/client';
import type { components } from '@/types/api.generated';
export const progressSchema = z.object({
  id: z.number().int(),
  user_id: z.string(),
  lesson_id: z.number().int(),
  completed: z.boolean(),
  score: z.number().int(),
  completed_at: z.string().nullable().optional(),
}) satisfies z.ZodType<components['schemas']['ProgressResponse']>;
export const xpSchema = z.object({
  id: z.number().int(),
  user_id: z.string(),
  xp: z.number().int(),
  reason: z.string(),
  created_at: z.string(),
}) satisfies z.ZodType<components['schemas']['XPHistoryResponse']>;
export const streakSchema = z.object({
  id: z.number().int(),
  user_id: z.string(),
  current_streak: z.number().int(),
  last_activity: z.string().nullable().optional(),
}) satisfies z.ZodType<components['schemas']['StreakResponse']>;
export type Progress = z.infer<typeof progressSchema>;
export type XpEvent = z.infer<typeof xpSchema>;
export async function getProgress(userId: string, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/progress/user/' + userId, {
    signal,
  });
  return z
    .array(progressSchema)
    .parse(data)
    .filter((item) => item.user_id === userId);
}
export async function getXp(userId: string, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/gamification/xp/' + userId, {
    signal,
  });
  return z
    .array(xpSchema)
    .parse(data)
    .filter((item) => item.user_id === userId);
}
export async function getStreak(userId: string, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/gamification/streak/' + userId, {
    signal,
  });
  const result = streakSchema.parse(data);
  if (result.user_id !== userId) throw new Error('Streak identity mismatch');
  return result;
}
