'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Flame, Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card, Skeleton, ProgressBar } from '@/components/ui/surface';
import { useI18n } from '@/providers/i18n-provider';
import {
  useProgress,
  useXp,
  useStreak,
  lessonOptions,
  lessonsOptions,
} from '@/features/learning/queries';
import {
  progressByLesson,
  weekActivity,
  recentCompletions,
  courseProgress,
} from './model';
import type { Progress } from './api';
import type { components } from '@/types/api.generated';
import styles from '@/features/learning/learning.module.scss';
export function Stats() {
  const {
    messages: { learning: t },
    locale,
  } = useI18n();
  const progress = useProgress();
  const xp = useXp();
  const streak = useStreak();
  const format = new Intl.NumberFormat(locale);
  const stats = [
    {
      label: t.completedLessons,
      Icon: BookOpen,
      value: progress.data
        ? [...progressByLesson(progress.data).values()].filter(
            (item) => item.completed,
          ).length
        : undefined,
      pending: progress.isPending,
    },
    {
      label: t.xp,
      Icon: Sparkles,
      value: xp.data?.reduce((sum, item) => sum + item.xp, 0),
      pending: xp.isPending,
    },
    {
      label: t.streak,
      Icon: Flame,
      value: streak.data?.current_streak,
      pending: streak.isPending,
    },
  ];
  return (
    <div className={styles.stats}>
      {stats.map(({ label, Icon, value, pending }) => (
        <Card key={label}>
          <span className={styles.statIcon}>
            <Icon size={20} />
          </span>
          <div>
            <p>{label}</p>
            {pending ? (
              <Skeleton />
            ) : (
              <strong>
                {value === undefined ? '—' : format.format(value)}
              </strong>
            )}
            {!pending && value === undefined && <small>{t.unknown}</small>}
          </div>
        </Card>
      ))}
    </div>
  );
}
export function WeeklyActivity({ records }: { records: Progress[] }) {
  const {
    messages: { learning: t },
    locale,
  } = useI18n();
  const [now] = useState(() => new Date());
  const days = weekActivity(records, now);
  const max = Math.max(1, ...days.map((day) => day.count));
  return (
    <Card>
      <h2 className={styles.sectionTitle}>{t.weekly}</h2>
      <p className={styles.muted}>{t.weeklyHint}</p>
      <div className={styles.week} role="list">
        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            role="listitem"
            aria-label={
              new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(
                day.date,
              ) +
              ': ' +
              day.count
            }
          >
            <span>{day.count}</span>
            <div className={styles.barTrack}>
              <i style={{ height: (day.count / max) * 100 + '%' }} />
            </div>
            <small>
              {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                day.date,
              )}
            </small>
            <b>{day.date.getDate()}</b>
          </div>
        ))}
      </div>
    </Card>
  );
}
function ActivityRow({ record }: { record: Progress }) {
  const lesson = useQuery(lessonOptions(record.lesson_id));
  const {
    messages: { learning: t },
    locale,
  } = useI18n();
  return (
    <Link href={'/lessons/' + record.lesson_id} className={styles.activityRow}>
      <span className={styles.statIcon}>
        <BookOpen size={18} />
      </span>
      <div>
        <strong>
          {lesson.data?.title ?? t.lesson + ' #' + record.lesson_id}
        </strong>
        <small>
          {record.completed_at &&
          Number.isFinite(Date.parse(record.completed_at))
            ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                new Date(record.completed_at),
              )
            : t.unknown}
        </small>
      </div>
      <span>
        {record.score} · {t.score}
      </span>
      <ArrowUpRight size={16} />
    </Link>
  );
}
export function RecentActivity({ records }: { records: Progress[] }) {
  const {
    messages: { learning: t },
  } = useI18n();
  const recent = recentCompletions(records).slice(0, 4);
  return (
    <Card>
      <h2 className={styles.sectionTitle}>{t.recent}</h2>
      {recent.length ? (
        recent.map((record) => <ActivityRow key={record.id} record={record} />)
      ) : (
        <p className={styles.muted}>{t.recentEmpty}</p>
      )}
    </Card>
  );
}
export function CourseProgressRow({
  course,
  records,
}: {
  course: components['schemas']['CourseResponse'];
  records: Progress[];
}) {
  const lessons = useQuery(lessonsOptions(course.id));
  const {
    messages: { learning: t },
  } = useI18n();
  const stats = lessons.data ? courseProgress(lessons.data, records) : null;
  return (
    <div className={styles.courseProgressRow}>
      <div>
        <Link href={'/courses/' + course.id}>
          {course.title}
          <ArrowUpRight size={15} />
        </Link>
        <span>{stats ? stats.completed + ' / ' + stats.total : '—'}</span>
      </div>
      {lessons.isPending ? (
        <Skeleton />
      ) : stats ? (
        <ProgressBar value={stats.percent} label={course.title} />
      ) : (
        <small className={styles.muted}>{t.partialError}</small>
      )}
    </div>
  );
}
