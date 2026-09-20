import { z } from 'zod';
import { api } from '@/services/api/client';
import {
  lessonSchema,
  exerciseSchema,
  exerciseResultSchema,
} from './contracts';
export async function getLessons(courseId: number, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/lessons/course/' + courseId, {
    signal,
  });
  return z
    .array(lessonSchema)
    .parse(data)
    .filter((lesson) => lesson.course_id === courseId)
    .sort((a, b) => a.order - b.order || a.id - b.id);
}
export async function getLesson(id: number, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/lessons/' + id, { signal });
  const lesson = lessonSchema.parse(data);
  if (lesson.id !== id) throw new Error('Lesson identity mismatch');
  return lesson;
}
export async function getExercises(lessonId: number, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/exercises/lesson/' + lessonId, {
    signal,
  });
  return z
    .array(exerciseSchema)
    .parse(data)
    .filter((exercise) => exercise.lesson_id === lessonId);
}
export async function submitExercise(exerciseId: number, answer: unknown) {
  const { data } = await api.post<unknown>(
    '/exercises/' + exerciseId + '/submit',
    { answer },
  );
  return exerciseResultSchema.parse(data);
}
