'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { getLearningPath } from './api';
export function useLearningPath(language: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['learning-path', user?.id, language],
    queryFn: ({ signal }) => getLearningPath(language, signal),
    enabled: !!user && language > 0,
  });
}
