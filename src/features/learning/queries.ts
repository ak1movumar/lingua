'use client';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/auth-provider';
import {
  getCourses,
  getLanguages,
  getCourse,
} from '@/features/courses/catalog-api';
import { getLessons, getLesson, getExercises } from '@/features/lessons/api';
import { getProgress, getXp, getStreak } from '@/features/progress/api';
export const coursesOptions = () =>
  queryOptions({
    queryKey: queryKeys.courses,
    queryFn: ({ signal }) => getCourses(signal),
  });
export const languagesOptions = () =>
  queryOptions({
    queryKey: queryKeys.languages,
    queryFn: ({ signal }) => getLanguages(signal),
  });
export const courseOptions = (id: number) =>
  queryOptions({
    queryKey: queryKeys.course(id),
    queryFn: ({ signal }) => getCourse(id, signal),
    enabled: id > 0,
  });
export const lessonsOptions = (courseId: number) =>
  queryOptions({
    queryKey: queryKeys.lessons(courseId),
    queryFn: ({ signal }) => getLessons(courseId, signal),
    enabled: courseId > 0,
  });
export const lessonOptions = (id: number) =>
  queryOptions({
    queryKey: queryKeys.lesson(id),
    queryFn: ({ signal }) => getLesson(id, signal),
    enabled: id > 0,
  });
export const exercisesOptions = (lessonId: number, enabled = true) =>
  queryOptions({
    queryKey: queryKeys.exercises(lessonId),
    queryFn: ({ signal }) => getExercises(lessonId, signal),
    enabled: lessonId > 0 && enabled,
    refetchOnWindowFocus: false,
  });
export function useProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.progress, user?.id],
    queryFn: ({ signal }) => getProgress(user!.id, signal),
    enabled: !!user,
  });
}
export function useXp() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.xp(user?.id ?? ''),
    queryFn: ({ signal }) => getXp(user!.id, signal),
    enabled: !!user,
  });
}
export function useStreak() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.streak(user?.id ?? ''),
    queryFn: ({ signal }) => getStreak(user!.id, signal),
    enabled: !!user,
    retry: false,
  });
}
