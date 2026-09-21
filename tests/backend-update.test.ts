import test from 'node:test';
import assert from 'node:assert/strict';
import type { AxiosAdapter } from 'axios';
import { api, publicApi } from '../src/services/api/client';
import { getUser, getUsers, sendRequest } from '../src/features/social/api';
import { addMember } from '../src/features/chats/api';
import { getLesson } from '../src/features/lessons/api';
import { startTest, submitTest } from '../src/features/placement/api';
const id = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
test('updated endpoints send usernames, use public profiles and preserve test attempt identity', async () => {
  const original = api.defaults.adapter;
  const requests: { url: string; body: unknown; params: unknown }[] = [];
  const adapter: AxiosAdapter = async (config) => {
    const body =
      typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    requests.push({ url: config.url!, body, params: config.params });
    let data: unknown;
    if (config.url === '/users/search') data = [{ id, username: 'Алина' }];
    else if (config.url === '/users/' + id + '/public')
      data = { id, username: 'Алина' };
    else if (config.url === '/friends/request')
      data = { id: 1, sender_id: other, receiver_id: id, status: 'pending' };
    else if (config.url === '/chats/' + other + '/members')
      data = {
        chat_id: other,
        user_id: id,
        user: { id, username: 'Алина' },
        joined_at: '2026-09-20T00:00:00Z',
      };
    else if (config.url?.endsWith('/start'))
      data = {
        attempt_id: id,
        test_id: other,
        is_placement: true,
        target_level: null,
        questions: [
          {
            id: 1,
            test_id: other,
            type: 'translate',
            question: 'Hello',
            level: 'A1',
            order: 1,
            options: {},
          },
        ],
      };
    else if (config.url === '/level-tests/attempts/' + id + '/submit')
      data = { attempt_id: id, score: 100, passed: true, result_level: 'A2' };
    else throw new Error('Unexpected request: ' + config.url);
    return { config, data, status: 200, statusText: 'OK', headers: {} };
  };
  api.defaults.adapter = adapter;
  try {
    assert.equal((await getUsers(undefined, 'Али'))[0]?.username, 'Алина');
    assert.deepEqual(requests.at(-1)?.params, { q: 'Али' });
    assert.equal((await getUser(id)).username, 'Алина');
    await sendRequest('Алина');
    assert.deepEqual(requests.at(-1)?.body, { username: 'Алина' });
    await addMember(other, 'Алина');
    assert.deepEqual(requests.at(-1)?.body, { username: 'Алина' });
    const attempt = await startTest(1);
    assert.equal(
      (await submitTest(attempt, { 1: ' Hello ' })).result_level,
      'A2',
    );
    assert.deepEqual(requests.at(-1)?.body, {
      answers: [{ question_id: 1, answer: ' Hello ' }],
    });
    await assert.rejects(startTest(1, 'A2'), /identity mismatch/);
  } finally {
    api.defaults.adapter = original;
  }
});
test('direct lesson navigation obeys personal course access even if the lesson endpoint says unlocked', async () => {
  const privateAdapter = api.defaults.adapter;
  const publicAdapter = publicApi.defaults.adapter;
  let unlocked = false;
  const lesson = {
    id: 1,
    course_id: 2,
    title: 'Hello',
    order: 1,
    is_locked: false,
  };
  const course = {
    id: 2,
    language_id: 3,
    title: 'English',
    description: '',
    level: 'A1',
    order: 1,
  };
  const adapter: AxiosAdapter = async (config) => {
    let data: unknown;
    if (config.url === '/lessons/1') data = lesson;
    else if (config.url === '/courses/2') data = course;
    else if (config.url === '/learning-path/3')
      data = {
        language_id: 3,
        level: 'A1',
        placement_completed: true,
        courses: [{ ...course, is_unlocked: unlocked, lessons: [lesson] }],
      };
    else throw new Error('Unexpected request: ' + config.url);
    return { config, data, status: 200, statusText: 'OK', headers: {} };
  };
  api.defaults.adapter = adapter;
  publicApi.defaults.adapter = adapter;
  try {
    assert.equal((await getLesson(1)).is_locked, true);
    unlocked = true;
    assert.equal((await getLesson(1)).is_locked, false);
  } finally {
    api.defaults.adapter = privateAdapter;
    publicApi.defaults.adapter = publicAdapter;
  }
});
