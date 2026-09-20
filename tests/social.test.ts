import test from 'node:test';
import assert from 'node:assert/strict';
import {
  friendSchema,
  requestSchema,
  requestsForUser,
  matchesUsername,
  pendingRequest,
} from '../src/features/social/contracts';
import { socialActionMutationKey } from '../src/features/social/queries';
import { safeAuthRedirect } from '../src/features/auth/redirect';
import { friendshipError } from '../src/features/social/errors';
import { friendshipMessages } from '../src/i18n/friendship';
const me = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const third = '00000000-0000-4000-8000-000000000003';
const request = (id: number, sender_id: string, receiver_id: string) => ({
  id,
  sender_id,
  receiver_id,
  status: 'opaque-backend-status',
});

test('social action key stays isolated per user to avoid global loading state', () => {
  const first = socialActionMutationKey('user-1');
  const second = socialActionMutationKey('user-2');
  assert.notEqual(JSON.stringify(first), JSON.stringify(second));
  assert.equal(
    JSON.stringify(first),
    JSON.stringify(['socialAction', 'user-1']),
  );
});

test('pending relationships distinguish incoming requests and exclude resolved history', () => {
  const outgoing = { ...request(1, me, other), status: 'pending' };
  const incoming = { ...request(2, other, me), status: 'pending' };
  assert.equal(pendingRequest([outgoing], me, other)?.sender_id, me);
  assert.equal(pendingRequest([incoming], me, other)?.receiver_id, me);
  assert.equal(
    pendingRequest(
      [
        { ...outgoing, status: 'accepted' },
        { ...incoming, status: 'rejected' },
      ],
      me,
      other,
    ),
    undefined,
  );
  assert.equal(
    pendingRequest([{ ...outgoing, status: 'pending' }], me, third),
    undefined,
  );
  assert.equal(
    pendingRequest([{ ...outgoing, status: 'custom-status' }], me, other),
    undefined,
  );
});

test('friendship errors distinguish backend permissions from network and validation errors', () => {
  const t = friendshipMessages.ru;
  const error = (status: number) => ({
    isAxiosError: true,
    response: { status, data: { detail: 'private diagnostics' } },
  });
  assert.equal(friendshipError(error(403), t), t.forbidden);
  assert.equal(friendshipError(error(500), t), t.server);
  assert.equal(friendshipError(error(422), t), t.invalidRequest);
  assert.equal(friendshipError(error(409), t), t.conflict + ' (HTTP 409)');
  assert.equal(friendshipError(error(400), t), t.conflict + ' (HTTP 400)');
  const malformed = requestSchema.safeParse({ id: 'unexpected' });
  assert.equal(malformed.success, false);
  if (!malformed.success)
    assert.equal(friendshipError(malformed.error, t), t.contract);
  assert.equal(friendshipError({ isAxiosError: true }, t), t.network);
  assert.equal(friendshipError(new Error('private diagnostics'), t), t.unknown);
});
test('request list excludes unrelated people and retains both directions', () => {
  const input = [
    request(1, me, other),
    request(2, other, me),
    request(3, other, third),
  ];
  assert.deepEqual(
    requestsForUser(input, me).map((item) => item.id),
    [1, 2],
  );
  assert.equal(input.length, 3);
  assert.deepEqual(requestsForUser(input, ''), []);
});
test('request status remains an opaque server string without invented enum values', () => {
  assert.equal(
    requestSchema.parse(request(1, me, other)).status,
    'opaque-backend-status',
  );
  assert.equal(
    requestSchema.safeParse({ ...request(1, me, other), status: true }).success,
    false,
  );
});
test('social identifiers follow UUID user and integer request schemas', () => {
  assert.equal(
    friendSchema.safeParse({ id: 1, username: 'Test' }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...request(1, me, other), sender_id: '../me' })
      .success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...request(1, me, other), id: '1' }).success,
    false,
  );
  assert.deepEqual(friendSchema.parse({ id: me, username: 'Test' }), {
    id: me,
    username: 'Test',
  });
});
test('username search handles Cyrillic and whitespace without mutating user data', () => {
  const user = { username: 'Айгүл' };
  assert.equal(matchesUsername(user, '  АЙГҮ  '), true);
  assert.equal(matchesUsername(user, 'other'), false);
  assert.equal(matchesUsername(user, ''), true);
  assert.equal(user.username, 'Айгүл');
});
test('auth resumes social routes and rejects malformed profile paths', () => {
  for (const path of ['/community', '/friends', '/users/' + me])
    assert.equal(safeAuthRedirect(path), path);
  for (const path of [
    '/users/me',
    '/users/1',
    '/users/' + me + '/edit',
    '/friends/../admin',
    '//community',
  ])
    assert.equal(safeAuthRedirect(path), '/dashboard');
});
