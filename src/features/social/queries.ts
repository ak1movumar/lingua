'use client';
import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { sessionStore } from '@/features/auth/session';
import { getApiFailure } from '@/services/api/errors';
import type { FriendRequest } from './contracts';
import {
  getUsers,
  getUser,
  getFriends,
  getRequests,
  sendRequest,
  respondToRequest,
  removeFriend,
} from './api';
export const usersOptions = (search = '') =>
  queryOptions({
    queryKey: [...queryKeys.users, search],
    queryFn: ({ signal }) => getUsers(signal, search),
    retry: (count, error) => getApiFailure(error).status !== 403 && count < 1,
  });
export const userOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.user(id),
    queryFn: ({ signal }) => getUser(id, signal),
  });
export const friendsOptions = () =>
  queryOptions({
    queryKey: queryKeys.friends,
    queryFn: ({ signal }) => getFriends(signal),
  });
export const requestsOptions = () =>
  queryOptions({
    queryKey: queryKeys.friendRequests,
    queryFn: ({ signal }) => getRequests(signal),
    refetchInterval: 15000,
  });
export function useRelationships() {
  const friends = useQuery(friendsOptions());
  const requests = useQuery(requestsOptions());
  return { friends, requests, ready: friends.isSuccess && requests.isSuccess };
}
export type SocialAction =
  | { type: 'send'; id: string; username: string }
  | { type: 'remove'; id: string }
  | { type: 'accept' | 'reject'; id: number };

export const socialActionMutationKey = (targetId: string | number) =>
  ['socialAction', targetId] as const;

export function useSocialAction(targetId?: string | number) {
  const client = useQueryClient();
  return useMutation({
    mutationKey: socialActionMutationKey(targetId ?? 'global'),
    retry: false,
    onMutate: () => sessionStore.getSnapshot().generation,
    mutationFn: async (action: SocialAction) => {
      if (action.type === 'send') return sendRequest(action.username);
      if (action.type === 'remove') return removeFriend(action.id);
      return respondToRequest(action.id, action.type);
    },
    onSuccess: (request, action, generation) => {
      if (
        generation !== sessionStore.getSnapshot().generation ||
        action.type === 'remove' ||
        !request
      )
        return;
      client.setQueryData<FriendRequest[]>(
        queryKeys.friendRequests,
        (current) => [
          ...(current ?? []).filter((item) => item.id !== request.id),
          request,
        ],
      );
    },
    onSettled: async (_data, _error, _action, generation) => {
      if (generation !== sessionStore.getSnapshot().generation) return;
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.friends }),
        client.invalidateQueries({ queryKey: queryKeys.friendRequests }),
      ]);
    },
  });
}
