import { beginnerCourse, type SeedExercise } from './beginner-course';
export type ImportLesson = {
  id: number;
  course_id: number;
  title: string;
  order: number;
};
export type ImportExercise = {
  id: number;
  lesson_id: number;
  type: string;
  question: string;
  options: Record<string, unknown>;
};
export type ImportApi = {
  course: () => Promise<{
    id: number;
    title: string;
    language_id: number;
    level: string;
  }>;
  lessons: () => Promise<ImportLesson[]>;
  exercises: (lessonId: number) => Promise<ImportExercise[]>;
  createLesson: (body: {
    course_id: number;
    title: string;
    order: number;
    is_locked: boolean;
  }) => Promise<ImportLesson>;
  createExercise: (
    body: SeedExercise & { lesson_id: number },
  ) => Promise<ImportExercise>;
};
export type ImportJournal = {
  read: () => string | null;
  write: (key: string) => void;
  clear: () => void;
};
export async function importBeginnerCourse(
  api: ImportApi,
  journal: ImportJournal,
  progress: (completed: number) => void,
  assertSession: () => void,
) {
  const seed = beginnerCourse;
  assertSession();
  const course = await api.course();
  assertSession();
  if (
    course.id !== seed.courseId ||
    course.title !== seed.title ||
    course.language_id !== seed.languageId ||
    course.level !== seed.level
  )
    throw new Error('COURSE_MISMATCH');
  const lessons = await api.lessons();
  assertSession();
  if (lessons.some((item) => item.course_id !== seed.courseId))
    throw new Error('COURSE_MISMATCH');
  let order = Math.max(0, ...lessons.map((item) => item.order));
  let completed = 0;
  for (const entry of seed.lessons) {
    assertSession();
    const lessonKey = 'lesson:' + entry.title;
    const found = lessons.filter((item) => item.title === entry.title);
    if (found.length > 1) throw new Error('DUPLICATE');
    let target = found[0];
    if (target && journal.read() === lessonKey) journal.clear();
    if (!target) {
      if (journal.read()) throw new Error('UNCERTAIN_WRITE');
      journal.write(lessonKey);
      target = await api.createLesson({
        course_id: seed.courseId,
        title: entry.title,
        order: ++order,
        is_locked: false,
      });
      assertSession();
      if (target.course_id !== seed.courseId || target.title !== entry.title)
        throw new Error('COURSE_MISMATCH');
      journal.clear();
      lessons.push(target);
    }
    assertSession();
    const existing = await api.exercises(target.id);
    assertSession();
    if (existing.some((item) => item.lesson_id !== target.id))
      throw new Error('COURSE_MISMATCH');
    for (const task of entry.exercises) {
      assertSession();
      const key = 'exercise:' + target.id + ':' + task.question;
      const matches = existing.filter(
        (item) => item.question === task.question,
      );
      if (
        matches.length > 1 ||
        matches.some(
          (item) =>
            item.type !== task.type || Object.keys(item.options).length !== 0,
        )
      )
        throw new Error('DUPLICATE');
      if (matches.length) {
        if (journal.read() === key) journal.clear();
      } else {
        if (journal.read()) throw new Error('UNCERTAIN_WRITE');
        journal.write(key);
        const created = await api.createExercise({
          ...task,
          lesson_id: target.id,
        });
        assertSession();
        if (
          created.lesson_id !== target.id ||
          created.question !== task.question ||
          created.type !== task.type
        )
          throw new Error('COURSE_MISMATCH');
        journal.clear();
        existing.push(created);
      }
      progress(++completed);
    }
  }
  if (journal.read()) throw new Error('UNCERTAIN_WRITE');
  return completed;
}
