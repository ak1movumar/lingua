'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { sessionStore } from './session';
import { logout } from './api';
export function useLogout() {
  const router = useRouter();
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const token = sessionStore.getSnapshot().refreshToken;
      sessionStore.clear();
      const generation = sessionStore.getSnapshot().generation;
      try {
        if (token) await logout(token);
        return { generation, failed: false };
      } catch {
        return { generation, failed: true };
      }
    },
    onSuccess: (result) => {
      if (sessionStore.getSnapshot().generation === result.generation)
        router.replace(result.failed ? '/login?logout=local' : '/login');
    },
  });
}
