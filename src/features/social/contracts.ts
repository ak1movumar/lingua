import { z } from 'zod';
import type { components } from '@/types/api.generated';
export const friendSchema = z.object({
  id: z.uuid(),
  username: z.string(),
}) satisfies z.ZodType<components['schemas']['FriendResponse']>;
export const requestSchema = z.object({
  id: z.number().int(),
  sender_id: z.uuid(),
  receiver_id: z.uuid(),
  status: z.string(),
}) satisfies z.ZodType<components['schemas']['FriendRequestResponse']>;
export type Friend = z.infer<typeof friendSchema>;
export type FriendRequest = z.infer<typeof requestSchema>;
export function pendingRequest(
  requests: FriendRequest[],
  me: string,
  other: string,
) {
  return requests
    .filter(
      (item) =>
        item.status.trim().toLowerCase() === 'pending' &&
        ((item.sender_id === me && item.receiver_id === other) ||
          (item.sender_id === other && item.receiver_id === me)),
    )
    .sort((a, b) => b.id - a.id)[0];
}
export function requestsForUser(requests: FriendRequest[], userId: string) {
  return requests.filter(
    (item) => item.sender_id === userId || item.receiver_id === userId,
  );
}
export function matchesUsername(
  user: Pick<Friend, 'username'>,
  search: string,
) {
  return user.username
    .toLocaleLowerCase()
    .includes(search.trim().toLocaleLowerCase());
}
