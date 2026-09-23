import { beginnerCourse } from './beginner-course';
import { elementaryCourse } from './elementary-course';
import { examQuestions } from './english-tests';
import axios from 'axios';
export type ImportRow = Record<string, unknown> & { id: number | string };
export type EnglishImportApi = {
  list(path: string): Promise<ImportRow[]>;
  create(path: string, body: Record<string, unknown>): Promise<ImportRow>;
  update(path: string, body: Record<string, unknown>): Promise<unknown>;
};
export type ImportJournal = {
  read(): string | null;
  write(key: string): void;
  clear(): void;
};
async function createWithRetry(
  api: EnglishImportApi,
  path: string,
  body: Record<string, unknown>,
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await api.create(path, body);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 429)
        throw error;
      if (attempt >= 3) throw error;
      const retryAfter = Number(error.response.headers['retry-after']);
      const delay = Number.isFinite(retryAfter)
        ? Math.min(Math.max(retryAfter * 1000, 1000), 30000)
        : 1000 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
export async function importEnglish(
  api: EnglishImportApi,
  journal: ImportJournal,
  report: (message: string) => void,
  assertSession: () => void,
  testsOnly = false,
) {
  let added = 0;
  let reused = 0;
  const lists = new Map<string, ImportRow[]>();
  async function list(path: string) {
    if (!lists.has(path)) lists.set(path, [...(await api.list(path))]);
    return lists.get(path)!;
  }
  async function ensure(
    path: string,
    listPath: string,
    key: string,
    body: Record<string, unknown>,
    match: (row: ImportRow) => boolean,
  ) {
    assertSession();
    const rows = await list(listPath);
    assertSession();
    const found = rows.filter(match);
    if (found.length > 1) throw Error('DUPLICATE: ' + key);
    if (found[0]) {
      if (journal.read() === key) journal.clear();
      reused++;
      return found[0];
    }
    if (journal.read() === key) {
      // A previous interrupted request may have been rejected before writing.
      // Reconcile against a fresh authoritative read before retrying that item.
      const verified = await api.list(listPath);
      assertSession();
      const matches = verified.filter(match);
      if (matches.length > 1) throw Error('DUPLICATE: ' + key);
      if (matches[0]) {
        journal.clear();
        lists.set(listPath, [...verified]);
        reused++;
        return matches[0];
      }
      journal.clear();
    }
    if (journal.read())
      throw Error('UNCERTAIN_WRITE: ' + journal.read() + ' BEFORE ' + key);
    journal.write(key);
    let row: ImportRow;
    try {
      row = await createWithRetry(api, path, body);
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      if (status && [400, 403, 404, 409, 422, 429].includes(status))
        journal.clear();
      throw error;
    }
    assertSession();
    if (!match(row)) throw Error('IDENTITY: ' + key);
    rows.push(row);
    journal.clear();
    added++;
    return row;
  }
  const language = await ensure(
    '/languages',
    '/languages',
    'english:language',
    { name: 'English', code: 'en', is_active: true },
    (r) => r.code === 'en',
  );
  if (language.is_active !== true) {
    assertSession();
    await api.update('/languages/' + language.id, {
      name: language.name,
      code: 'en',
      is_active: true,
    });
  }
  const courseSeeds = [
    {
      ...beginnerCourse,
      title: 'English A1 · First Steps',
      description:
        'Английский с нуля: приветствия, знакомство, семья, повседневные действия и базовая грамматика. 12 уроков, 96 упражнений с объяснениями на русском.',
      level: 'A1' as const,
    },
    {
      ...elementaryCourse,
      description:
        'Английский для повседневной жизни: прошедшее и будущее время, сравнения, советы, опыт и путешествия. 12 уроков, 96 упражнений с объяснениями на русском.',
      level: 'A2' as const,
    },
  ];
  const courseIds: (number | string)[] = [];
  for (const [ci, seed] of (testsOnly ? [] : courseSeeds).entries()) {
    report(seed.title);
    const course = await ensure(
      '/courses',
      '/courses/language/' + language.id,
      'english:course:' + seed.level,
      {
        language_id: language.id,
        title: seed.title,
        description: seed.description,
        level: seed.level,
        order: ci + 1,
      },
      (r) =>
        r.language_id === language.id &&
        r.title === seed.title &&
        r.level === seed.level,
    );
    courseIds.push(course.id);
    for (const [li, unit] of seed.lessons.entries()) {
      report(seed.level + ' · ' + unit.title);
      const lesson = await ensure(
        '/lessons',
        '/lessons/course/' + course.id,
        'english:lesson:' + course.id + ':' + li,
        {
          course_id: course.id,
          title: unit.title,
          order: li + 1,
          is_locked: false,
        },
        (r) => r.course_id === course.id && r.title === unit.title,
      );
      for (const [ei, exercise] of unit.exercises.entries())
        await ensure(
          '/exercises',
          '/exercises/lesson/' + lesson.id,
          'english:exercise:' + lesson.id + ':' + ei,
          { lesson_id: lesson.id, ...exercise },
          (r) =>
            r.lesson_id === lesson.id &&
            r.question === exercise.question &&
            r.type === exercise.type,
        );
    }
  }
  const exams = [
    {
      level: null,
      placement: true,
      questions: [
        ...examQuestions('A1').filter((_, i) => i % 2 === 0),
        ...examQuestions('A2').filter((_, i) => i % 2 === 0),
      ].map((q, i) => ({ ...q, order: i + 1 })),
    },
    { level: 'A1', placement: false, questions: examQuestions('A1') },
    { level: 'A2', placement: false, questions: examQuestions('A2') },
  ];
  const testIds: (number | string)[] = [];
  for (const exam of exams) {
    report('Тест · ' + (exam.level ?? 'A1–A2'));
    const test = await ensure(
      '/level-tests',
      '/level-tests',
      'english:test:' + (exam.level ?? 'placement'),
      {
        language_id: language.id,
        is_placement: exam.placement,
        target_level: exam.level,
        passing_score: 70,
        is_active: false,
      },
      (r) =>
        r.language_id === language.id &&
        r.is_placement === exam.placement &&
        r.target_level === exam.level,
    );
    testIds.push(test.id);
    const existing = await list('/level-tests/' + test.id + '/questions');
    assertSession();
    if (
      existing.some(
        (r) =>
          !exam.questions.some(
            (q) => q.question === r.question && q.level === r.level,
          ),
      )
    )
      throw Error('EXISTING_TEST: ' + test.id);
    for (const [i, q] of exam.questions.entries())
      await ensure(
        '/level-tests/' + test.id + '/questions',
        '/level-tests/' + test.id + '/questions',
        'english:question:' + test.id + ':' + i,
        q,
        (r) =>
          r.test_id === test.id &&
          r.question === q.question &&
          r.level === q.level,
      );
    assertSession();
    if (test.is_active !== true)
      await api.update('/level-tests/' + test.id, {
        target_level: exam.level,
        passing_score: 70,
        is_active: true,
      });
  }
  assertSession();
  return { languageId: language.id, courseIds, testIds, added, reused };
}
