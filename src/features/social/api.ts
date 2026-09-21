import { z } from 'zod';
import { api } from '@/services/api/client';
import { friendSchema, requestSchema } from './contracts';
export async function getUsers(signal?: AbortSignal, search = '') {
  return z.array(friendSchema).parse(
    (
      await api.get<unknown>('/users/search', {
        signal,
        params: { q: search },
      })
    ).data,
  );
}
export async function getUser(id: string, signal?: AbortSignal) {
  const user = friendSchema.parse(
    (
      await api.get<unknown>('/users/' + encodeURIComponent(id) + '/public', {
        signal,
      })
    ).data,
  );
  if (user.id !== id) throw new Error('User identity mismatch');
  return user;
}
export async function getFriends(signal?: AbortSignal) {
  return z
    .array(friendSchema)
    .parse((await api.get<unknown>('/friends/', { signal })).data);
}
export async function getRequests(signal?: AbortSignal) {
  return z
    .array(requestSchema)
    .parse((await api.get<unknown>('/friends/requests', { signal })).data);
}
export async function sendRequest(username: string) {
  return requestSchema.parse(
    (
      await api.post<unknown>('/friends/request', {
        username: z.string().trim().min(1).parse(username),
      })
    ).data,
  );
}
export async function respondToRequest(
  id: number,
  action: 'accept' | 'reject',
) {
  return requestSchema.parse(
    (await api.post<unknown>(`/friends/request/${id}/${action}`)).data,
  );
}
export async function removeFriend(id: string) {
  await api.delete('/friends/' + encodeURIComponent(id));
}
