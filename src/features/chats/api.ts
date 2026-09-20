import { z } from 'zod';
import { api } from '@/services/api/client';
import {
  chatSchema,
  memberSchema,
  messageSchema,
  reactionSchema,
  orderedMessages,
  type ChatInput,
} from './contracts';
const chatPath = (id: string) =>
  '/chats/' + encodeURIComponent(z.uuid().parse(id));
const messagesPath = (id: string) => chatPath(id) + '/messages';
const messagePath = (chat: string, id: string) =>
  messagesPath(chat) + '/' + encodeURIComponent(z.uuid().parse(id));
function checkedMessage(data: unknown, chat: string, id?: string) {
  const message = messageSchema.parse(data);
  if (message.chat_id !== chat || (id && message.id !== id))
    throw new Error('Message identity mismatch');
  return message;
}
export async function getChats(signal?: AbortSignal) {
  return z
    .array(chatSchema)
    .parse((await api.get<unknown>('/chats/', { signal })).data);
}
export async function getChat(id: string, signal?: AbortSignal) {
  const chat = chatSchema.parse(
    (await api.get<unknown>(chatPath(id), { signal })).data,
  );
  if (chat.id !== id) throw new Error('Chat identity mismatch');
  return chat;
}
export async function createChat(input: ChatInput) {
  return chatSchema.parse((await api.post<unknown>('/chats/', input)).data);
}
export async function getMembers(id: string, signal?: AbortSignal) {
  return z
    .array(memberSchema)
    .parse((await api.get<unknown>(chatPath(id) + '/members', { signal })).data)
    .filter((member) => member.chat_id === id);
}
export async function addMember(chat: string, user: string) {
  const member = memberSchema.parse(
    (
      await api.post<unknown>(chatPath(chat) + '/members', {
        user_id: z.uuid().parse(user),
      })
    ).data,
  );
  if (member.chat_id !== chat || member.user_id !== user)
    throw new Error('Member identity mismatch');
  return member;
}
export async function removeMember(chat: string, user: string) {
  await api.delete(
    chatPath(chat) + '/members/' + encodeURIComponent(z.uuid().parse(user)),
  );
}
export async function getMessages(chat: string, signal?: AbortSignal) {
  return orderedMessages(
    z
      .array(messageSchema)
      .parse((await api.get<unknown>(messagesPath(chat), { signal })).data),
    chat,
  );
}
export async function sendMessage(chat: string, content: string) {
  return checkedMessage(
    (await api.post<unknown>(messagesPath(chat), { content })).data,
    chat,
  );
}
export async function editMessage(chat: string, id: string, content: string) {
  return checkedMessage(
    (await api.patch<unknown>(messagePath(chat, id), { content })).data,
    chat,
    id,
  );
}
export async function deleteMessage(chat: string, id: string) {
  await api.delete(messagePath(chat, id));
}
export async function markRead(chat: string, id: string) {
  return checkedMessage(
    (await api.patch<unknown>(messagePath(chat, id) + '/read')).data,
    chat,
    id,
  );
}
export async function getReactions(
  chat: string,
  id: string,
  signal?: AbortSignal,
) {
  return z
    .array(reactionSchema)
    .parse(
      (await api.get<unknown>(messagePath(chat, id) + '/reactions', { signal }))
        .data,
    )
    .filter((reaction) => reaction.message_id === id);
}
export async function addReaction(chat: string, id: string, reaction: string) {
  const result = reactionSchema.parse(
    (
      await api.post<unknown>(messagePath(chat, id) + '/reactions', {
        reaction,
      })
    ).data,
  );
  if (result.message_id !== id) throw new Error('Reaction identity mismatch');
  return result;
}
export async function removeReaction(
  chat: string,
  id: string,
  reaction: string,
) {
  await api.delete(messagePath(chat, id) + '/reactions', {
    data: { reaction },
  });
}
