'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { useI18n } from '@/providers/i18n-provider';
import { lessonsOptions } from '@/features/learning/queries';
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
    messages: { learning: t },
  } = useI18n();
  const lessons = useQuery(lessonsOptions(course.id));
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
      {lessons.isPending ? (
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
      {stats && <ProgressBar label={t.courseProgress} value={stats.percent} />}
      <LinkButton href={'/courses/' + course.id} variant="secondary">
        {stats && stats.completed > 0 && stats.completed < stats.total
          ? t.continue
          : t.openCourse}
        <ArrowUpRight size={17} />
      </LinkButton>
    </Card>
  );
}
