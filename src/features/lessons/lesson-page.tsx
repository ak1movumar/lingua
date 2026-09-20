'use client';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/providers/i18n-provider';
import { LinkButton } from '@/components/ui/link-button';
import { EmptyState } from '@/components/ui/states';
import {
  LearningSkeleton,
  LearningError,
} from '@/features/learning/data-state';
import { lessonOptions, exercisesOptions } from '@/features/learning/queries';
import { LessonSession } from './lesson-session';
import styles from './lesson.module.scss';
export function LessonPage({ id }: { id: number }) {
  const lesson = useQuery(lessonOptions(id));
  const exercises = useQuery(
    exercisesOptions(id, !!lesson.data && !lesson.data.is_locked),
  );
  const {
    messages: { learning: t },
  } = useI18n();
  if (lesson.isPending)
    return (
      <main id="main-content" className={styles.workspace}>
        <LearningSkeleton />
      </main>
    );
  if (lesson.isError)
    return (
      <main id="main-content" className={styles.workspace}>
        <LearningError onRetry={() => void lesson.refetch()} />
        <LinkButton href="/courses" variant="ghost">
          {t.backCourses}
        </LinkButton>
      </main>
    );
  if (lesson.data.is_locked)
    return (
      <main id="main-content" className={styles.workspace}>
        <EmptyState
          title={t.lockedTitle}
          description={t.lockedHint}
          action={
            <LinkButton href={'/courses/' + lesson.data.course_id}>
              {t.returnCourse}
            </LinkButton>
          }
        />
      </main>
    );
  if (exercises.isPending)
    return (
      <main id="main-content" className={styles.workspace}>
        <LearningSkeleton />
      </main>
    );
  if (exercises.isError)
    return (
      <main id="main-content" className={styles.workspace}>
        <LearningError onRetry={() => void exercises.refetch()} />
        <LinkButton href={'/courses/' + lesson.data.course_id} variant="ghost">
          {t.returnCourse}
        </LinkButton>
      </main>
    );
  return (
    <LessonSession key={id} lesson={lesson.data} exercises={exercises.data} />
  );
}
