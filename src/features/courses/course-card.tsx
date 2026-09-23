'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { useI18n } from '@/providers/i18n-provider';
import { lessonsOptions } from '@/features/learning/queries';
import { useLearningPath } from '@/features/placement/queries';
import { placementMessages } from '@/i18n/placement';
import { courseProgress } from '@/features/progress/model';
import type { Progress } from '@/features/progress/api';
import type { components } from '@/types/api.generated';
import styles from '@/features/learning/learning.module.scss';
export function CourseCard({
  course,
  language,
  progress,
}: {
  course: components['schemas']['CourseResponse'];
  language?: string;
  progress?: Progress[];
}) {
  const {
    locale,
    messages: { learning: t },
  } = useI18n();
  const lessons = useQuery(lessonsOptions(course.id));
  const path = useLearningPath(course.language_id);
  const locked =
    path.isSuccess &&
    !path.data.courses.find((item) => item.id === course.id)?.is_unlocked;
  const stats =
    lessons.data && progress ? courseProgress(lessons.data, progress) : null;
  return (
    <Card className={styles.courseCard}>
      <div className={styles.courseVisual}>
        <BookOpen size={32} />
        <Badge tone="primary">{course.level}</Badge>
      </div>
      <div className={styles.courseText}>
        {language && <p className={styles.overline}>{language}</p>}
        <h2>{course.title}</h2>
        <p>{course.description}</p>
      </div>
      {locked ? (
        <p className={styles.muted}>
          {path.data.placement_completed
            ? placementMessages[locale].locked
            : placementMessages[locale].needed}
        </p>
      ) : lessons.isPending ? (
        <Skeleton />
      ) : lessons.isError ? (
        <small className={styles.muted}>{t.partialError}</small>
      ) : (
        <div className={styles.cardMeta}>
          <span>
            {t.lessons}: {lessons.data.length}
          </span>
          {stats && <span>{stats.percent}%</span>}
        </div>
      )}
      {stats && !locked && (
        <ProgressBar label={t.courseProgress} value={stats.percent} />
      )}
      <LinkButton href={'/courses/' + course.id} variant="secondary">
        {stats && stats.completed > 0 && stats.completed < stats.total
          ? t.continue
          : t.openCourse}
        <ArrowUpRight size={17} />
      </LinkButton>
    </Card>
  );
}
