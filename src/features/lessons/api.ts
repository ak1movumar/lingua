import { z } from 'zod';
import { api } from '@/services/api/client';
import { getCourse } from '@/features/courses/catalog-api';
import { getLearningPath } from '@/features/placement/api';
import {
  lessonSchema,
  exerciseSchema,
  exerciseResultSchema,
} from './contracts';
export async function getLessons(courseId: number, signal?: AbortSignal) {
  const course = await getCourse(courseId, signal);
  const path = await getLearningPath(course.language_id, signal);
  const entry = path.courses.find((item) => item.id === courseId);
  return (entry?.lessons ?? [])
    .filter((lesson) => lesson.course_id === courseId)
    .map((lesson) => ({
      ...lesson,
      is_locked: !entry?.is_unlocked || lesson.is_locked,
    }))
    .sort((a, b) => a.order - b.order || a.id - b.id);
}
export async function getLesson(id: number, signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/lessons/' + id, { signal });
  const lesson = lessonSchema.parse(data);
  if (lesson.id !== id) throw new Error('Lesson identity mismatch');
  const lessons = await getLessons(lesson.course_id, signal);
  return (
    lessons.find((item) => item.id === id) ?? { ...lesson, is_locked: true }
  );
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
