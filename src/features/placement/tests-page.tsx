'use client';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/services/api/client';
import { useI18n } from '@/providers/i18n-provider';
import { placementMessages } from '@/i18n/placement';
import { LearningShell } from '@/features/learning/learning-shell';
import { languagesOptions } from '@/features/learning/queries';
import {
  LearningError,
  LearningSkeleton,
} from '@/features/learning/data-state';
import { Card, PageHeader } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { EmptyState } from '@/components/ui/states';
import { levelSchema } from './contracts';
import styles from './path.module.scss';

const testsSchema = z.array(
  z.object({
    id: z.uuid(),
    language_id: z.number().int(),
    is_placement: z.boolean(),
    target_level: levelSchema.nullable(),
    is_active: z.boolean(),
    passing_score: z.number(),
  }),
);
export function TestsPage() {
  const { locale } = useI18n();
  const t = placementMessages[locale];
  const languages = useQuery(languagesOptions());
  const tests = useQuery({
    queryKey: ['level-tests'],
    queryFn: async ({ signal }) =>
      testsSchema.parse((await api.get('/level-tests', { signal })).data),
  });
  const active = tests.data
    ?.filter((test) => test.is_active)
    .sort(
      (a, b) =>
        a.language_id - b.language_id ||
        Number(b.is_placement) - Number(a.is_placement) ||
        (a.target_level ?? '').localeCompare(b.target_level ?? ''),
    );
  return (
    <LearningShell active="courses">
      <PageHeader title={t.tests} description={t.hint} />
      {tests.isPending ? (
        <LearningSkeleton />
      ) : tests.isError ? (
        <LearningError onRetry={() => void tests.refetch()} />
      ) : !active?.length ? (
        <EmptyState title={t.unavailable} description={t.hint} />
      ) : (
        <div className={styles.testGrid}>
          {active.map((test) => (
            <Card key={test.id} className={styles.testCard}>
              <p>
                {
                  languages.data?.find(
                    (language) => language.id === test.language_id,
                  )?.name
                }
              </p>
              <h2>
                {test.is_placement
                  ? t.placement
                  : t.completion + ' · ' + test.target_level}
              </h2>
              <p>{test.is_placement ? t.needed : t.completionHint}</p>
              <LinkButton
                href={
                  '/level-tests/' +
                  test.language_id +
                  (test.is_placement ? '' : '?level=' + test.target_level)
                }
              >
                {t.start}
              </LinkButton>
            </Card>
          ))}
        </div>
      )}
    </LearningShell>
  );
}
