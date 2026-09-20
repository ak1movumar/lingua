import test from 'node:test';
import assert from 'node:assert/strict';
import { beginnerCourse } from '../src/features/admin/course-import/beginner-course';
import {
  importBeginnerCourse,
  type ImportApi,
  type ImportLesson,
  type ImportExercise,
} from '../src/features/admin/course-import/import-beginner-course';
function fixture() {
  const lessons: ImportLesson[] = [];
  const exercises: ImportExercise[] = [];
  let pending: string | null = null;
  let writes = 0;
  const api: ImportApi = {
    course: async () => ({
      id: 1,
      title: beginnerCourse.title,
      language_id: 1,
      level: 'A1',
    }),
    lessons: async () => [...lessons],
    exercises: async (id) => exercises.filter((item) => item.lesson_id === id),
    createLesson: async (body) => {
      writes++;
      const item = { ...body, id: lessons.length + 1 };
      lessons.push(item);
      return item;
    },
    createExercise: async (body) => {
      writes++;
      const item = { ...body, id: exercises.length + 1 };
      exercises.push(item);
      return item;
    },
  };
  return {
    api,
    lessons,
    exercises,
    journal: {
      read: () => pending,
      write: (key: string) => {
        pending = key;
      },
      clear: () => {
        pending = null;
      },
    },
    writes: () => writes,
  };
}
test('beginner course has 12 lessons and 96 unique text exercises with explicit answers', () => {
  assert.equal(beginnerCourse.lessons.length, 12);
  const tasks = beginnerCourse.lessons.flatMap((item) => item.exercises);
  assert.equal(tasks.length, 96);
  assert.equal(new Set(tasks.map((item) => item.question)).size, 96);
  for (const task of tasks) {
    assert.ok(['translate', 'fill_gap'].includes(task.type));
    assert.ok(task.correct_answer.trim());
    assert.deepEqual(task.options, {});
  }
});
test('import creates only target course content and rerun does not duplicate writes', async () => {
  const f = fixture();
  assert.equal(
    await importBeginnerCourse(
      f.api,
      f.journal,
      () => {},
      () => {},
    ),
    96,
  );
  assert.equal(f.writes(), 108);
  assert.ok(f.lessons.every((item) => item.course_id === 1));
  await importBeginnerCourse(
    f.api,
    f.journal,
    () => {},
    () => {},
  );
  assert.equal(f.writes(), 108);
});
test('wrong course identity prevents all mutations', async () => {
  const f = fixture();
  f.api.course = async () => ({
    id: 2,
    title: beginnerCourse.title,
    language_id: 1,
    level: 'A1',
  });
  await assert.rejects(
    importBeginnerCourse(
      f.api,
      f.journal,
      () => {},
      () => {},
    ),
    /COURSE_MISMATCH/,
  );
  assert.equal(f.writes(), 0);
});
test('ambiguous write without a visible record blocks a second POST', async () => {
  const f = fixture();
  let attempts = 0;
  f.api.createLesson = async () => {
    attempts++;
    throw new Error('timeout');
  };
  await assert.rejects(
    importBeginnerCourse(
      f.api,
      f.journal,
      () => {},
      () => {},
    ),
    /timeout/,
  );
  await assert.rejects(
    importBeginnerCourse(
      f.api,
      f.journal,
      () => {},
      () => {},
    ),
    /UNCERTAIN_WRITE/,
  );
  assert.equal(attempts, 1);
});
test('committed write with a lost response is reconciled on the next run', async () => {
  const f = fixture();
  const original = f.api.createExercise;
  let first = true;
  f.api.createExercise = async (body) => {
    const result = await original(body);
    if (first) {
      first = false;
      throw new Error('timeout');
    }
    return result;
  };
  await assert.rejects(
    importBeginnerCourse(
      f.api,
      f.journal,
      () => {},
      () => {},
    ),
    /timeout/,
  );
  await importBeginnerCourse(
    f.api,
    f.journal,
    () => {},
    () => {},
  );
  assert.equal(f.writes(), 108);
  assert.equal(f.exercises.length, 96);
});
test('existing unrelated lessons are preserved and imported lessons are appended', async () => {
  const f = fixture();
  f.lessons.push({ id: 100, course_id: 1, title: 'Existing lesson', order: 5 });
  await importBeginnerCourse(
    f.api,
    f.journal,
    () => {},
    () => {},
  );
  assert.equal(f.lessons[0]?.title, 'Existing lesson');
  assert.equal(f.lessons[1]?.order, 6);
});
