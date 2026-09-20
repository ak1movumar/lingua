'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Play } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/providers/i18n-provider';
import { Badge, Card, PageHeader, ProgressBar } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { EmptyState } from '@/components/ui/states';
import { LearningShell } from '@/features/learning/learning-shell';
import {
  LearningSkeleton,
  LearningError,
} from '@/features/learning/data-state';
import {
  courseOptions,
  lessonsOptions,
  languagesOptions,
  useProgress,
} from '@/features/learning/queries';
import {
  courseProgress,
  nextLesson,
  progressByLesson,
} from '@/features/progress/model';
import styles from '@/features/learning/learning.module.scss';
export function CourseDetails({ id }: { id: number }) {
  const {
    messages: { learning: t },
  } = useI18n();
  const course = useQuery(courseOptions(id));
  const lessons = useQuery(lessonsOptions(id));
  const languages = useQuery(languagesOptions());
  const progress = useProgress();
  const indexed = progressByLesson(progress.data ?? []);
  const stats =
    lessons.data && progress.data
      ? courseProgress(lessons.data, progress.data)
      : null;
  const next =
    lessons.data && progress.data
      ? nextLesson(lessons.data, progress.data)
      : undefined;
  return (
    <LearningShell active="courses">
      <Link className={styles.backLink} href="/courses">
        <ArrowLeft size={17} />
        {t.backCourses}
      </Link>
      {course.isPending ? (
        <LearningSkeleton />
      ) : course.isError ? (
        <LearningError onRetry={() => void course.refetch()} />
      ) : (
        <>
          <PageHeader
            eyebrow={
              languages.data?.find(
                (language) => language.id === course.data.language_id,
              )?.name
            }
            title={course.data.title}
            description={course.data.description}
            action={<Badge tone="primary">{course.data.level}</Badge>}
          />
          <div className={styles.detailGrid}>
            <section className={styles.lessonList}>
              <h2>{t.lessons}</h2>
              {lessons.isPending ? (
                <LearningSkeleton />
              ) : lessons.isError ? (
                <LearningError onRetry={() => void lessons.refetch()} />
              ) : !lessons.data.length ? (
                <EmptyState title={t.noLessons} description={t.noLessonsHint} />
              ) : (
                lessons.data.map((lesson, index) => {
                  const complete = indexed.get(lesson.id)?.completed;
                  const content = (
                    <>
                      <span
                        className={styles.lessonIcon}
                        data-completed={complete}
                      >
                        {lesson.is_locked ? (
                          <LockKeyhole size={19} />
                        ) : complete ? (
                          <Check size={20} />
                        ) : (
                          <Play size={17} />
                        )}
                      </span>
                      <div>
                        <small>
                          {t.lesson} {index + 1}
                        </small>
                        <h3>{lesson.title}</h3>
                        <span>
                          {lesson.is_locked
                            ? t.locked
                            : complete
                              ? t.completed
                              : t.available}
                        </span>
                      </div>
                      {!lesson.is_locked && <ArrowRight size={18} />}
                    </>
                  );
                  return lesson.is_locked ? (
                    <div
                      className={styles.lessonRow}
                      aria-disabled="true"
                      key={lesson.id}
                    >
                      {content}
                    </div>
                  ) : (
                    <Link
                      className={styles.lessonRow}
                      href={'/lessons/' + lesson.id}
                      key={lesson.id}
                    >
                      {content}
                    </Link>
                  );
                })
              )}
            </section>
            <aside className={styles.summary}>
              <Card>
                <p className={styles.overline}>{t.courseSummary}</p>
                <h2>{t.courseProgress}</h2>
                {stats ? (
                  <>
                    <strong className={styles.largeNumber}>
                      {stats.percent}
                      <span>%</span>
                    </strong>
                    <ProgressBar
                      label={t.courseProgress}
                      value={stats.percent}
                    />
                    <p className={styles.muted}>
                      {stats.completed} / {stats.total} · {t.completed}
                    </p>
                  </>
                ) : (
                  <p className={styles.muted}>
                    {progress.isError ? t.partialError : t.loading}
                  </p>
                )}
                {next ? (
                  <LinkButton href={'/lessons/' + next.id}>
                    {stats?.completed ? t.continueLesson : t.startLesson}
                    <ArrowRight size={17} />
                  </LinkButton>
                ) : stats && stats.total > 0 ? (
                  <p>
                    {stats.completed === stats.total
                      ? t.allComplete
                      : t.allLocked}
                  </p>
                ) : null}
                <LinkButton variant="ghost" href="/progress">
                  {t.viewProgress}
                </LinkButton>
              </Card>
            </aside>
          </div>
        </>
      )}
    </LearningShell>
  );
}
