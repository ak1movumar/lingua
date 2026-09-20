import type { Lesson } from '@/features/lessons/contracts';
import type { Progress } from './api';
/** A lesson is counted once even if the API contains multiple historical records. */
export function progressByLesson(records: Progress[]) {
  const map = new Map<number, Progress>();
  for (const record of records) {
    const previous = map.get(record.lesson_id);
    if (
      !previous ||
      (record.completed && !previous.completed) ||
      (record.completed === previous.completed && record.id > previous.id)
    )
      map.set(record.lesson_id, record);
  }
  return map;
}
export function courseProgress(lessons: Lesson[], records: Progress[]) {
  const indexed = progressByLesson(records);
  const completed = lessons.filter(
    (lesson) => indexed.get(lesson.id)?.completed,
  ).length;
  return {
    completed,
    total: lessons.length,
    percent: lessons.length
      ? Math.round((completed / lessons.length) * 100)
      : 0,
  };
}
export function nextLesson(lessons: Lesson[], records: Progress[]) {
  const indexed = progressByLesson(records);
  return [...lessons]
    .sort((a, b) => a.order - b.order || a.id - b.id)
    .find((lesson) => !lesson.is_locked && !indexed.get(lesson.id)?.completed);
}
export function recentCompletions(records: Progress[]) {
  return [...progressByLesson(records).values()]
    .filter(
      (record) =>
        record.completed &&
        record.completed_at &&
        Number.isFinite(Date.parse(record.completed_at)),
    )
    .sort((a, b) => Date.parse(b.completed_at!) - Date.parse(a.completed_at!));
}
export function resumeRecord(records: Progress[]) {
  const unique = [...progressByLesson(records).values()];
  return (
    unique.find((record) => !record.completed) ??
    recentCompletions(records)[0] ??
    unique[0]
  );
}
export function weekActivity(records: Progress[], now = new Date()) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    return { date, count: 0 };
  });
  for (const record of recentCompletions(records)) {
    const date = new Date(record.completed_at!);
    const day = days.find(
      (day) =>
        day.date.getFullYear() === date.getFullYear() &&
        day.date.getMonth() === date.getMonth() &&
        day.date.getDate() === date.getDate(),
    );
    if (day) day.count++;
  }
  return days;
}
