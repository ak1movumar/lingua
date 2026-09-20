'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Card, Badge, ProgressBar } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import {
  useProgress,
  lessonOptions,
  courseOptions,
  lessonsOptions,
} from './queries';
import {
  courseProgress,
  nextLesson,
  resumeRecord,
} from '@/features/progress/model';
import { LearningError, LearningSkeleton } from './data-state';
import type { Progress } from '@/features/progress/api';
import styles from './learning.module.scss';
function ResumeCourse({
  record,
  records,
}: {
  record: Progress;
  records: Progress[];
}) {
  const {
    messages: { learning: t },
  } = useI18n();
  const lesson = useQuery(lessonOptions(record.lesson_id));
  const course = useQuery(courseOptions(lesson.data?.course_id ?? 0));
  const lessons = useQuery(lessonsOptions(lesson.data?.course_id ?? 0));
  if (lesson.isError || course.isError || lessons.isError)
    return (
      <LearningError
        onRetry={() => {
          void lesson.refetch();
          if (lesson.data) {
            void course.refetch();
            void lessons.refetch();
          }
        }}
      />
    );
  if (!lesson.data || !course.data || !lessons.data)
    return <LearningSkeleton />;
  const next = nextLesson(lessons.data, records);
  const stats = courseProgress(lessons.data, records);
  return (
    <Card className={styles.continueCard}>
      <div className={styles.continueIcon}>
        <BookOpen size={34} />
      </div>
      <div>
        <p className={styles.overline}>{t.currentCourse}</p>
        <h2>{course.data.title}</h2>
        <Badge tone="primary">{course.data.level}</Badge>
        <p>
          {next?.title ??
            (stats.completed === stats.total ? t.allComplete : t.allLocked)}
        </p>
        <ProgressBar value={stats.percent} label={t.courseProgress} />
        <small>
          {stats.completed} / {stats.total} · {t.completed}
        </small>
        <LinkButton
          href={next ? '/lessons/' + next.id : '/courses/' + course.data.id}
        >
          {next ? t.continueLesson : t.openCourse}
          <ArrowRight size={17} />
        </LinkButton>
      </div>
    </Card>
  );
}
export function ContinueLearning() {
  const progress = useProgress();
  const {
    messages: { learning: t },
  } = useI18n();
  if (progress.isPending) return <LearningSkeleton />;
  if (progress.isError)
    return <LearningError onRetry={() => void progress.refetch()} />;
  const record = resumeRecord(progress.data);
  return record ? (
    <ResumeCourse record={record} records={progress.data} />
  ) : (
    <Card className={styles.continueCard}>
      <div className={styles.continueIcon}>
        <BookOpen size={34} />
      </div>
      <div>
        <p className={styles.overline}>{t.currentCourse}</p>
        <h2>{t.begin}</h2>
        <p>{t.beginHint}</p>
        <LinkButton href="/courses">
          {t.browse}
          <ArrowRight size={17} />
        </LinkButton>
      </div>
    </Card>
  );
}
