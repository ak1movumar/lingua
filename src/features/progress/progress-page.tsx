'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Card } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { EmptyState } from '@/components/ui/states';
import { useI18n } from '@/providers/i18n-provider';
import { LearningShell } from '@/features/learning/learning-shell';
import {
  LearningError,
  LearningSkeleton,
} from '@/features/learning/data-state';
import {
  coursesOptions,
  useProgress,
  useXp,
} from '@/features/learning/queries';
import {
  Stats,
  WeeklyActivity,
  RecentActivity,
  CourseProgressRow,
} from './progress-widgets';
import styles from '@/features/learning/learning.module.scss';
export function ProgressPage() {
  const {
    messages: { learning: t },
    locale,
  } = useI18n();
  const progress = useProgress();
  const xp = useXp();
  const courses = useQuery(coursesOptions());
  const [visible, setVisible] = useState(6);
  const [historyVisible, setHistoryVisible] = useState(10);
  return (
    <LearningShell active="progress">
      <PageHeader
        eyebrow={t.progress}
        title={t.progressTitle}
        description={t.progressHint}
      />
      <Stats />
      {progress.isPending ? (
        <LearningSkeleton />
      ) : progress.isError ? (
        <LearningError onRetry={() => void progress.refetch()} />
      ) : (
        <>
          {!progress.data.length && (
            <EmptyState
              title={t.progressEmpty}
              description={t.progressEmptyHint}
              action={<LinkButton href="/courses">{t.browse}</LinkButton>}
            />
          )}
          <div className={styles.dashboardGrid}>
            <WeeklyActivity records={progress.data} />
            <RecentActivity records={progress.data} />
          </div>
          <section className={styles.section}>
            <Card>
              <h2 className={styles.sectionTitle}>{t.courseProgress}</h2>
              {courses.isPending ? (
                <LearningSkeleton />
              ) : courses.isError ? (
                <LearningError onRetry={() => void courses.refetch()} />
              ) : !courses.data.length ? (
                <p className={styles.muted}>{t.noCourses}</p>
              ) : (
                <>
                  {courses.data.slice(0, visible).map((course) => (
                    <CourseProgressRow
                      key={course.id}
                      course={course}
                      records={progress.data}
                    />
                  ))}
                  {visible < courses.data.length && (
                    <Button
                      variant="secondary"
                      onClick={() => setVisible(visible + 6)}
                    >
                      {t.loadMore}
                    </Button>
                  )}
                </>
              )}
            </Card>
          </section>
        </>
      )}
      <section className={styles.section}>
        <Card>
          <h2 className={styles.sectionTitle}>{t.xpHistory}</h2>
          <p className={styles.helper}>{t.xpHint}</p>
          {xp.isPending ? (
            <LearningSkeleton />
          ) : xp.isError ? (
            <LearningError onRetry={() => void xp.refetch()} />
          ) : !xp.data.length ? (
            <p className={styles.muted}>{t.noActivity}</p>
          ) : (
            <>
              <ul className={styles.history}>
                {[...xp.data]
                  .sort(
                    (a, b) =>
                      Date.parse(b.created_at) - Date.parse(a.created_at),
                  )
                  .slice(0, historyVisible)
                  .map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.reason}</strong>
                        <small>
                          {Number.isFinite(Date.parse(item.created_at))
                            ? new Intl.DateTimeFormat(locale, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              }).format(new Date(item.created_at))
                            : t.unknown}
                        </small>
                      </div>
                      <b>
                        {item.xp > 0 ? '+' : ''}
                        {item.xp} XP
                      </b>
                    </li>
                  ))}
              </ul>
              {historyVisible < xp.data.length && (
                <Button
                  variant="secondary"
                  onClick={() => setHistoryVisible(historyVisible + 10)}
                >
                  {t.loadMore}
                </Button>
              )}
            </>
          )}
        </Card>
      </section>
      <p className={styles.helper}>{t.historyNote}</p>
    </LearningShell>
  );
}
