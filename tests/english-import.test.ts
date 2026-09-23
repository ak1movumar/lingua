import test from 'node:test';
import assert from 'node:assert/strict';
import {
  importEnglish,
  type ImportRow,
  type EnglishImportApi,
} from '../src/features/admin/course-import/english-import';
import { elementaryCourse } from '../src/features/admin/course-import/elementary-course';
import { examQuestions } from '../src/features/admin/course-import/english-tests';
function fixture() {
  const tables: Record<string, ImportRow[]> = {};
  let next = 1;
  let pending: string | null = null;
  let writes = 0;
  const api: EnglishImportApi = {
    list: async (path) => {
      const course = path.match(/^\/courses\/language\/(\d+)$/);
      if (course)
        return (tables['/courses'] ?? []).filter(
          (r) => r.language_id === Number(course[1]),
        );
      const lesson = path.match(/^\/lessons\/course\/(\d+)$/);
      if (lesson)
        return (tables['/lessons'] ?? []).filter(
          (r) => r.course_id === Number(lesson[1]),
        );
      const exercise = path.match(/^\/exercises\/lesson\/(\d+)$/);
      if (exercise)
        return (tables['/exercises'] ?? []).filter(
          (r) => r.lesson_id === Number(exercise[1]),
        );
      return tables[path] ?? [];
    },
    create: async (path, body) => {
      writes++;
      const row = { id: next++, ...body };
      const test = path.match(/^\/level-tests\/(\d+)\/questions$/);
      if (test) Object.assign(row, { test_id: Number(test[1]) });
      (tables[path] ??= []).push(row);
      return row;
    },
    update: async (path, body) => {
      const cut = path.lastIndexOf('/');
      const found = tables[path.slice(0, cut)]?.find(
        (r) => r.id === Number(path.slice(cut + 1)),
      );
      assert.ok(found);
      Object.assign(found, body);
      return found;
    },
  };
  return {
    api,
    tables,
    journal: {
      read: () => pending,
      write: (v: string) => {
        pending = v;
      },
      clear: () => {
        pending = null;
      },
    },
    writes: () => writes,
  };
}
test('an interrupted request with no saved record is retried after two authoritative reads', async () => {
  const f = fixture();
  f.journal.write('english:language');
  let reads = 0;
  const list = f.api.list;
  f.api.list = async (path) => {
    if (path === '/languages') reads++;
    return list(path);
  };
  await importEnglish(
    f.api,
    f.journal,
    () => {},
    () => {},
    true,
  );
  assert.equal(reads, 2);
  assert.equal(f.tables['/languages']!.length, 1);
  assert.equal(f.journal.read(), null);
});
test('English package creates two courses, 24 lessons, 192 exercises and three complete exams; rerun creates nothing', async () => {
  const f = fixture();
  await importEnglish(
    f.api,
    f.journal,
    () => {},
    () => {},
  );
  assert.equal(f.tables['/courses']!.length, 2);
  assert.equal(f.tables['/lessons']!.length, 24);
  assert.equal(f.tables['/exercises']!.length, 192);
  assert.equal(f.tables['/level-tests']!.length, 3);
  for (const exam of f.tables['/level-tests']!) {
    assert.equal(exam.is_active, true);
    assert.equal(
      f.tables['/level-tests/' + exam.id + '/questions']!.length,
      24,
    );
  }
  const count = f.writes();
  await importEnglish(
    f.api,
    f.journal,
    () => {},
    () => {},
  );
  assert.equal(f.writes(), count);
});
test('ambiguous create is reconciled after retry without duplicate writes', async () => {
  const f = fixture();
  const create = f.api.create;
  let fail = true;
  f.api.create = async (p, b) => {
    const result = await create(p, b);
    if (fail) {
      fail = false;
      throw Error('Connection lost');
    }
    return result;
  };
  await assert.rejects(
    importEnglish(
      f.api,
      f.journal,
      () => {},
      () => {},
    ),
  );
  assert.ok(f.journal.read());
  await importEnglish(
    f.api,
    f.journal,
    () => {},
    () => {},
  );
  assert.equal(f.tables['/languages']!.length, 1);
  assert.equal(f.journal.read(), null);
});
test('A2 lessons and exam questions have nonempty unique prompts and answers without lesson hints', () => {
  assert.equal(elementaryCourse.lessons.length, 12);
  const questions = elementaryCourse.lessons.flatMap((l) => l.exercises);
  assert.equal(questions.length, 96);
  assert.equal(new Set(questions.map((q) => q.question)).size, 96);
  for (const level of ['A1', 'A2'] as const) {
    const exam = examQuestions(level);
    assert.equal(exam.length, 24);
    for (const q of exam) {
      assert.ok(q.correct_answer.trim());
      assert.equal(q.correct_answer, q.correct_answer.toLowerCase());
      assert.deepEqual(q.options, {});
      assert.equal(q.level, level);
    }
  }
});
test('tests-only import fills an existing empty placement test and creates completion tests without touching courses', async () => {
  const f = fixture();
  const language = await f.api.create('/languages', {
    name: 'English',
    code: 'en',
    is_active: true,
  });
  const placement = await f.api.create('/level-tests', {
    language_id: language.id,
    is_placement: true,
    target_level: null,
    is_active: true,
    passing_score: 70,
  });
  const result = await importEnglish(
    f.api,
    f.journal,
    () => {},
    () => {},
    true,
  );
  assert.deepEqual(result.courseIds, []);
  assert.equal(f.tables['/courses'], undefined);
  assert.equal(f.tables['/level-tests']!.length, 3);
  assert.equal(
    f.tables['/level-tests/' + placement.id + '/questions']!.length,
    24,
  );
  const writes = f.writes();
  await importEnglish(
    f.api,
    f.journal,
    () => {},
    () => {},
    true,
  );
  assert.equal(f.writes(), writes);
});
