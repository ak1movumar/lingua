'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { sessionStore } from '@/features/auth/session';
import { queryKeys } from '@/constants/query-keys';
import type { components } from '@/types/api.generated';
import { updateAccount } from './api';
export function useAccountUpdate() {
  const { user } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationKey: ['accountUpdate'],
    retry: false,
    gcTime: 0,
    mutationFn: async (input: components['schemas']['UserUpdateSchema']) => {
      if (!user) throw new Error('No active account');
      const generation = sessionStore.getSnapshot().generation;
      await client.cancelQueries({ queryKey: queryKeys.me });
      if (sessionStore.getSnapshot().generation !== generation)
        throw new Error('Account session changed');
      return { user: await updateAccount(input, user.id), generation };
    },
    onSuccess: async (result) => {
      if (sessionStore.getSnapshot().generation !== result.generation) return;
      await client.cancelQueries({ queryKey: queryKeys.me });
      if (sessionStore.getSnapshot().generation !== result.generation) return;
      client.setQueryData(queryKeys.me, result.user);
      client.setQueryData(queryKeys.user(result.user.id), result.user);
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.users }),
        client.invalidateQueries({ queryKey: queryKeys.friends }),
      ]);
    },
  });
}
