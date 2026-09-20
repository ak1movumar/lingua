import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireScrollLock } from '../src/lib/scroll-lock';
import { createDraftStore, messageDraftKey } from '../src/lib/session-drafts';
import { safeAuthRedirect } from '../src/features/auth/redirect';
test('nested modals preserve scroll lock until the last owner closes, in either order', () => {
  for (const parentFirst of [true, false]) {
    const body = { style: { overflow: 'auto' } };
    const parent = acquireScrollLock(body);
    const child = acquireScrollLock(body);
    (parentFirst ? parent : child)();
    assert.equal(body.style.overflow, 'hidden');
    (parentFirst ? child : parent)();
    assert.equal(body.style.overflow, 'auto');
    parent();
    child();
    assert.equal(body.style.overflow, 'auto');
  }
});
test('scroll locks restore empty initial style and can be acquired after release', () => {
  const body = { style: { overflow: '' } };
  acquireScrollLock(body)();
  assert.equal(body.style.overflow, '');
  const release = acquireScrollLock(body);
  assert.equal(body.style.overflow, 'hidden');
  release();
  assert.equal(body.style.overflow, '');
});
test('drafts are isolated per user and chat, retained across subscriptions, and cleared on session end', () => {
  const drafts = createDraftStore();
  const key = messageDraftKey('user', 'chat');
  const unsubscribe = drafts.subscribe(() => {});
  drafts.set(key, 'Салам!');
  unsubscribe();
  assert.equal(drafts.get(key), 'Салам!');
  assert.equal(drafts.get(messageDraftKey('another', 'chat')), '');
  assert.equal(drafts.get(messageDraftKey('user', 'another')), '');
  drafts.clear();
  assert.equal(drafts.get(key), '');
});
test('a late send acknowledgement cannot erase a newer draft', () => {
  const drafts = createDraftStore();
  drafts.set('chat', 'new text');
  drafts.acknowledge('chat', 'old text');
  assert.equal(drafts.get('chat'), 'new text');
  drafts.acknowledge('chat', 'new text');
  assert.equal(drafts.get('chat'), '');
});
test('deep-link query parameters survive safe sign-in redirect without allowing external paths', () => {
  const destination = '/chats?to=00000000-0000-4000-8000-000000000001';
  assert.equal(safeAuthRedirect(destination), destination);
  assert.equal(
    safeAuthRedirect('https://other.invalid/chats?to=1'),
    '/dashboard',
  );
});
