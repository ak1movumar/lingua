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
  'level-tests': 'LevelTestCreate',
  'test-questions': 'LevelTestQuestionCreate',
  users: null,
} as const;
export type Resource = keyof typeof resources;
export const resourcePath = (resource: Resource, parentTest?: string) =>
  resource === 'test-questions'
    ? '/level-tests/' + encodeURIComponent(parentTest ?? '') + '/questions'
    : '/' + resource + (resource === 'users' ? '/' : '');
export const resourceItemPath = (resource: Resource, id: number | string) =>
  (resource === 'test-questions'
    ? '/level-tests/questions/'
    : '/' + resource + '/') + encodeURIComponent(id);
export async function getResourceRows(
  resource: Resource,
  signal?: AbortSignal,
  parentTest?: string,
) {
  return z
    .array(rowSchema)
    .parse(
      (await api.get<unknown>(resourcePath(resource, parentTest), { signal }))
        .data,
    );
}
