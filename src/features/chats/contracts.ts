import { z } from 'zod';
import type { components } from '@/types/api.generated';
import { friendSchema } from '@/features/social/contracts';
export const chatSchema = z.object({
  id: z.uuid(),
  type: z.enum(['private', 'group']),
  language_id: z.number().int().nullable(),
  created_at: z.string(),
}) satisfies z.ZodType<components['schemas']['ChatResponse']>;
export const memberSchema = z.object({
  chat_id: z.uuid(),
  user_id: z.uuid(),
  user: friendSchema,
  joined_at: z.string(),
}) satisfies z.ZodType<components['schemas']['ChatMemberResponse']>;
export const messageSchema = z.object({
  id: z.uuid(),
  chat_id: z.uuid(),
  sender_id: z.uuid(),
  sender: friendSchema,
  content: z.string(),
  created_at: z.string(),
  is_read: z.boolean(),
}) satisfies z.ZodType<components['schemas']['MessageResponse']>;
export const reactionSchema = z.object({
  id: z.number().int(),
  message_id: z.uuid(),
  user_id: z.uuid(),
  reaction: z.string(),
  created_at: z.string(),
});
export type Chat = z.infer<typeof chatSchema>;
export type ChatMember = z.infer<typeof memberSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Reaction = z.infer<typeof reactionSchema>;
export type ChatInput = components['schemas']['ChatCreate'];
export function orderedMessages(messages: Message[], chatId: string) {
  return [
    ...new Map(
      messages
        .filter((message) => message.chat_id === chatId)
        .map((message) => [message.id, message]),
    ).values(),
  ].sort(
    (a, b) =>
      Date.parse(a.created_at) - Date.parse(b.created_at) ||
      a.id.localeCompare(b.id),
  );
}
export function mergeMessage(messages: Message[], next: Message) {
  return orderedMessages(
    [...messages.filter((message) => message.id !== next.id), next],
    next.chat_id,
  );
}
/** A read acknowledgement can predate an edit or deletion; merge only its read flag. */
export function applyMessageAcknowledgement(
  messages: Message[],
  next: Message,
  kind: 'send' | 'edit' | 'read',
) {
  if (kind === 'send') return mergeMessage(messages, next);
  return messages.map((message) => {
    if (message.id !== next.id || message.chat_id !== next.chat_id)
      return message;
    return kind === 'read' ? { ...message, is_read: next.is_read } : next;
  });
}
export function unreadMessages(messages: Message[], me: string) {
  return messages.filter(
    (message) => message.sender_id !== me && !message.is_read,
  );
}
export function reactionGroups(reactions: Reaction[], me: string) {
  const groups = new Map<
    string,
    { value: string; count: number; own: boolean }
  >();
  for (const reaction of new Map(
    reactions.map((item) => [item.id, item]),
  ).values()) {
    const group = groups.get(reaction.reaction) ?? {
      value: reaction.reaction,
      count: 0,
      own: false,
    };
    group.count += 1;
    group.own ||= reaction.user_id === me;
    groups.set(reaction.reaction, group);
  }
  return [...groups.values()];
}
export function chatDisplayName(
  chat: Chat,
  members: ChatMember[],
  names: Map<string, string>,
  me: string,
  fallback: string,
) {
  const others = members.filter(
    (member) => member.chat_id === chat.id && member.user_id !== me,
  );
  return others.length
    ? others
        .map(
          (member) =>
            member.user.username || names.get(member.user_id) || member.user_id,
        )
        .join(', ')
    : fallback;
}
