import { z } from 'zod';
import type { components } from '@/types/api.generated';
export const lessonSchema = z.object({
  id: z.number().int(),
  course_id: z.number().int(),
  title: z.string(),
  order: z.number().int(),
  is_locked: z.boolean(),
}) satisfies z.ZodType<components['schemas']['LessonResponse']>;
export const exerciseSchema = z.object({
  id: z.number().int(),
  lesson_id: z.number().int(),
  type: z.enum(['choice', 'translate', 'fill_gap', 'match']),
  question: z.string(),
  options: z.record(z.string(), z.unknown()),
}) satisfies z.ZodType<components['schemas']['ExerciseResponse']>;
export const exerciseResultSchema = z.object({
  correct: z.boolean(),
  score: z.number().int(),
}) satisfies z.ZodType<components['schemas']['ExerciseResult']>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseResult = z.infer<typeof exerciseResultSchema>;
