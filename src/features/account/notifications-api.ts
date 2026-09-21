import { z } from 'zod';
import { api } from '@/services/api/client';
export const notificationSchema = z.object({
  id: z.number().int(),
  user_id: z.uuid(),
  type: z.enum(['friend_request', 'achievement', 'message', 'system']),
  title: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.string(),
});
export async function getNotifications(userId: string, signal?: AbortSignal) {
  return z
    .array(notificationSchema)
    .parse((await api.get<unknown>('/notifications', { signal })).data)
    .filter((item) => item.user_id === userId);
}
export async function readNotifications() {
  await api.patch('/notifications/read-all');
}
export async function deleteNotification(id: number) {
  await api.delete('/notifications/' + id);
}
export async function readNotification(id: number) {
  const result = notificationSchema.parse(
    (await api.patch<unknown>('/notifications/' + id + '/read')).data,
  );
  if (result.id !== id) throw new Error('Notification identity mismatch');
  return result;
}
