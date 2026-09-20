import { z } from 'zod';
import { api } from '@/services/api/client';
import { rowSchema } from './model';
export const resources = {
  languages: 'LanguageCreate',
  courses: 'CourseCreate',
  lessons: 'LessonCreate',
  exercises: 'ExerciseCreate',
  achievements: 'AchievementCreate',
  challenges: 'ChallengeCreate',
  users: null,
} as const;
export type Resource = keyof typeof resources;
export const resourcePath = (resource: Resource) =>
  '/' + resource + (resource === 'users' ? '/' : '');
export async function getResourceRows(
  resource: Resource,
  signal?: AbortSignal,
) {
  return z
    .array(rowSchema)
    .parse((await api.get<unknown>(resourcePath(resource), { signal })).data);
}
