import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTestSubmission,
  testStartSchema,
  learningPathSchema,
} from '../src/features/placement/contracts';
import { safeAuthRedirect } from '../src/features/auth/redirect';
import {
  resourcePath,
  resourceItemPath,
} from '../src/features/admin/resources';
const id = '00000000-0000-4000-8000-000000000001';
const attempt = testStartSchema.parse({
  attempt_id: id,
  test_id: id,
  is_placement: true,
  target_level: null,
  questions: [1, 2].map((n) => ({
    id: n,
    test_id: id,
    level: 'A1',
    type: 'translate',
    question: 'Hello?',
    options: {},
    order: n,
  })),
});
test('test submissions require every question, preserve answer values and exclude unrelated answers', () => {
  assert.throws(() => buildTestSubmission(attempt, { 1: 'Hello' }));
  assert.throws(() => buildTestSubmission(attempt, { 1: 'Hello', 2: '  ' }));
  assert.throws(() => buildTestSubmission({ ...attempt, questions: [] }, {}));
  assert.deepEqual(
    buildTestSubmission(attempt, { 1: ' Hello ', 2: { a: 'b' }, 3: 'ignored' }),
    {
      answers: [
        { question_id: 1, answer: ' Hello ' },
        { question_id: 2, answer: { a: 'b' } },
      ],
    },
  );
});
test('learning access is validated without treating false as true or inventing a level', () => {
  const path = {
    language_id: 1,
    level: null,
    placement_completed: false,
    courses: [
      {
        id: 1,
        language_id: 1,
        title: 'A1',
        description: '',
        level: 'A1',
        order: 1,
        is_unlocked: false,
        lessons: [],
      },
    ],
  };
  assert.equal(learningPathSchema.parse(path).courses[0]?.is_unlocked, false);
  assert.equal(
    learningPathSchema.safeParse({ ...path, placement_completed: 'false' })
      .success,
    false,
  );
  assert.equal(
    learningPathSchema.safeParse({ ...path, level: 'D1' }).success,
    false,
  );
});
test('test question creation uses its parent while editing and deleting use the question route', () => {
  assert.equal(
    resourcePath('test-questions', id),
    '/level-tests/' + id + '/questions',
  );
  assert.equal(
    resourceItemPath('test-questions', 42),
    '/level-tests/questions/42',
  );
  assert.equal(resourceItemPath('level-tests', id), '/level-tests/' + id);
});
test('learning path and level test links survive authentication', () => {
  for (const route of [
    '/learning-path',
    '/level-tests/1',
    '/level-tests/2?level=A2',
  ])
    assert.equal(safeAuthRedirect(route), route);
  for (const route of [
    '/level-tests/0',
    '/level-tests/../admin',
    '/learning-path/evil',
  ])
    assert.equal(safeAuthRedirect(route), '/dashboard');
});
