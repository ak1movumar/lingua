import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chatSchema,
  messageSchema,
  orderedMessages,
  mergeMessage,
  unreadMessages,
  reactionGroups,
  chatDisplayName,
  type Message,
  type Reaction,
} from '../src/features/chats/contracts';
import { safeAuthRedirect } from '../src/features/auth/redirect';
import { applyMessageAcknowledgement } from '../src/features/chats/contracts';
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const chat = id(1);
const me = id(2);
const other = id(3);
test('late read acknowledgement neither restores deleted messages nor overwrites edited content', () => {
  const old = message(4, { content: 'Old text', is_read: true });
  const updated = message(4, { content: 'Edited text' });
  assert.deepEqual(applyMessageAcknowledgement([updated], old, 'read'), [
    { ...updated, is_read: true },
  ]);
  assert.deepEqual(applyMessageAcknowledgement([], old, 'read'), []);
  assert.deepEqual(applyMessageAcknowledgement([], old, 'edit'), []);
});
const message = (n: number, extra: Partial<Message> = {}): Message => ({
  id: id(n),
  chat_id: chat,
  sender_id: other,
  sender: { id: other, username: 'Other' },
  content: 'Contract test',
  created_at: '2026-09-15T10:00:00Z',
  is_read: false,
  ...extra,
});
test('message ordering uses instants across offsets, removes duplicates and isolates chats', () => {
  const input = [
    message(4, { created_at: '2026-09-15T12:00:00+06:00' }),
    message(5, { created_at: '2026-09-15T08:00:00Z' }),
    message(6, { chat_id: id(9) }),
    message(4, { created_at: '2026-09-15T12:00:00+06:00', content: 'Updated' }),
  ];
  const result = orderedMessages(input, chat);
  assert.deepEqual(
    result.map((item) => item.id),
    [id(4), id(5)],
  );
  assert.equal(result[0]?.content, 'Updated');
  assert.equal(input.length, 4);
});
test('server acknowledgement replaces a message without duplicating it', () => {
  const original = [message(4), message(5)];
  const result = mergeMessage(
    original,
    message(4, { content: 'New text', is_read: true }),
  );
  assert.equal(result.length, 2);
  assert.equal(result.find((item) => item.id === id(4))?.is_read, true);
  assert.equal(original[0]?.is_read, false);
});
test('unread badge counts only unread incoming messages', () => {
  assert.deepEqual(
    unreadMessages(
      [
        message(4),
        message(5, { sender_id: me }),
        message(6, { is_read: true }),
      ],
      me,
    ).map((item) => item.id),
    [id(4)],
  );
});
test('reaction grouping preserves actual strings, counts records once and tracks ownership', () => {
  const reaction = (n: number, user_id: string, value: string): Reaction => ({
    id: n,
    user_id,
    message_id: id(4),
    reaction: value,
    created_at: '2026-09-15T00:00:00Z',
  });
  assert.deepEqual(
    reactionGroups(
      [
        reaction(1, me, '👍'),
        reaction(2, other, '👍'),
        reaction(1, me, '👍'),
        reaction(3, other, 'custom'),
      ],
      me,
    ),
    [
      { value: '👍', count: 2, own: true },
      { value: 'custom', count: 1, own: false },
    ],
  );
});
test('chat labels derive from real members and never borrow another chat membership', () => {
  const record = chatSchema.parse({
    id: chat,
    type: 'private',
    language_id: null,
    created_at: '2026-09-15T00:00:00Z',
  });
  const members = [
    {
      chat_id: chat,
      user_id: me,
      user: { id: me, username: 'Me' },
      joined_at: '',
    },
    {
      chat_id: chat,
      user_id: other,
      user: { id: other, username: 'Айгүл' },
      joined_at: '',
    },
    {
      chat_id: id(9),
      user_id: id(8),
      user: { id: id(8), username: 'Other chat' },
      joined_at: '',
    },
  ];
  assert.equal(
    chatDisplayName(
      record,
      members,
      new Map([[other, 'Айгүл']]),
      me,
      'Private',
    ),
    'Айгүл',
  );
  assert.equal(
    chatDisplayName(record, [], new Map(), me, 'Private'),
    'Private',
  );
  assert.equal(
    chatDisplayName(record, members, new Map(), me, 'Private'),
    'Айгүл',
  );
});
test('message schema does not coerce read status or invent edited metadata', () => {
  assert.equal(messageSchema.safeParse(message(4)).success, true);
  assert.equal(
    messageSchema.safeParse({ ...message(4), is_read: 'false' }).success,
    false,
  );
  assert.equal('edited_at' in messageSchema.parse(message(4)), false);
  assert.equal(
    chatSchema.safeParse({
      id: chat,
      type: 'channel',
      language_id: null,
      created_at: '',
    }).success,
    false,
  );
});
test('chat deep links survive login while traversal and numeric IDs are rejected', () => {
  for (const path of ['/chats', '/chats/' + chat, '/chats?to=' + other])
    assert.equal(safeAuthRedirect(path), path);
  for (const path of [
    '/chats/1',
    '/chats/' + chat + '/admin',
    '/chats/../users',
    '//chats',
  ])
    assert.equal(safeAuthRedirect(path), '/dashboard');
});
