import test from 'node:test';
import assert from 'node:assert/strict';
import {
  courseProgress,
  nextLesson,
  progressByLesson,
  recentCompletions,
  resumeRecord,
  weekActivity,
} from '../src/features/progress/model';
import { shouldCompleteLesson } from '../src/features/lessons/use-lesson-attempt';
import { parseRouteId } from '../src/lib/route-id';
import { safeAuthRedirect } from '../src/features/auth/redirect';
import type { Lesson } from '../src/features/lessons/contracts';
import type { Progress } from '../src/features/progress/api';
const lesson = (id: number, order: number, is_locked = false): Lesson => ({
  id,
  order,
  is_locked,
  course_id: 7,
  title: 'Lesson ' + id,
});
const record = (
  id: number,
  lesson_id: number,
  completed: boolean,
  completed_at?: string | null,
): Progress => ({
  id,
  lesson_id,
  completed,
  completed_at,
  user_id: 'test-user',
  score: completed ? 10 : 0,
});
test('lesson completion triggers only after the final exercise is correct', () => {
  assert.equal(shouldCompleteLesson(0, 3, true), false);
  assert.equal(shouldCompleteLesson(2, 3, true), true);
  assert.equal(shouldCompleteLesson(2, 3, false), false);
  assert.equal(shouldCompleteLesson(0, 0, true), false);
});

test('course percentage counts only its own unique completed lessons', () => {
  const result = courseProgress(
    [lesson(1, 1), lesson(2, 2)],
    [record(1, 1, true), record(2, 1, true), record(3, 99, true)],
  );
  assert.deepEqual(result, { completed: 1, total: 2, percent: 50 });
});
test('empty course has no invented completion', () => {
  assert.deepEqual(courseProgress([], []), {
    completed: 0,
    total: 0,
    percent: 0,
  });
});
test('next lesson respects backend lock, course order and completion', () => {
  const lessons = [lesson(3, 3), lesson(2, 2, true), lesson(1, 1)];
  assert.equal(nextLesson(lessons, [record(1, 1, true)])?.id, 3);
  assert.equal(lessons[0]?.id, 3);
});
test('no available unfinished lessons means no continue target', () => {
  assert.equal(nextLesson([lesson(1, 1, true)], []), undefined);
  assert.equal(nextLesson([lesson(1, 1)], [record(1, 1, true)]), undefined);
});
test('later incomplete duplicate does not erase an existing completion', () => {
  assert.equal(
    progressByLesson([record(1, 1, true), record(2, 1, false)]).get(1)
      ?.completed,
    true,
  );
});
test('undated and invalid completion timestamps never create calendar activity', () => {
  const records = [record(1, 1, true, null), record(2, 2, true, 'invalid')];
  assert.equal(recentCompletions(records).length, 0);
  assert.equal(
    weekActivity(records, new Date(2026, 8, 15)).reduce(
      (sum, day) => sum + day.count,
      0,
    ),
    0,
  );
  assert.ok(resumeRecord(records));
});
test('weekly chart uses local calendar boundaries and ignores out-of-window events', () => {
  const today = new Date(2026, 8, 15, 12);
  const records = [
    record(1, 1, true, new Date(2026, 8, 15, 0, 1).toISOString()),
    record(2, 2, true, new Date(2026, 8, 9, 23, 59).toISOString()),
    record(3, 3, true, new Date(2026, 8, 8, 12).toISOString()),
    record(4, 4, false, new Date(2026, 8, 15, 12).toISOString()),
  ];
  const days = weekActivity(records, today);
  assert.equal(days.length, 7);
  assert.equal(days[0]?.count, 1);
  assert.equal(days[6]?.count, 1);
  assert.equal(
    days.reduce((sum, day) => sum + day.count, 0),
    2,
  );
});
test('course and lesson route IDs reject unsafe or non-canonical inputs', () => {
  for (const input of [
    '0',
    '-1',
    '1.5',
    '1e3',
    'abc',
    '01',
    '9007199254740992',
  ])
    assert.equal(parseRouteId(input), null);
  assert.equal(parseRouteId('15'), 15);
});
test('login returns to implemented learning pages but never external or unknown paths', () => {
  for (const path of ['/courses', '/courses/15', '/lessons/8', '/progress'])
    assert.equal(safeAuthRedirect(path), path);
  for (const path of [
    '/courses/0',
    '/lessons',
    '/courses/1/edit',
    '//evil.invalid',
    '/courses/../settings',
  ])
    assert.equal(safeAuthRedirect(path), '/dashboard');
});
