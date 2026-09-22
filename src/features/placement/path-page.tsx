'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { placementMessages } from '@/i18n/placement';
import { LearningShell } from '@/features/learning/learning-shell';
import { languagesOptions } from '@/features/learning/queries';
import {
  LearningError,
  LearningSkeleton,
} from '@/features/learning/data-state';
import { PageHeader, Card } from '@/components/ui/surface';
import { Select } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/states';
import { LinkButton } from '@/components/ui/link-button';
import { useLearningPath } from './queries';
import { LearningJourney } from './journey';
import styles from './path.module.scss';

export function PathPage() {
  const { locale } = useI18n();
  const t = placementMessages[locale];
  const languages = useQuery(languagesOptions());
  const [selected, setSelected] = useState('');
  const language = Number(
    selected ||
      languages.data?.find((item) => item.is_active)?.id ||
      languages.data?.[0]?.id ||
      0,
  );
  const path = useLearningPath(language);
  return (
    <LearningShell active="courses">
      <div>
        <PageHeader title={t.title} description={t.hint} />
        {languages.isPending ? (
          <LearningSkeleton />
        ) : languages.isError ? (
          <LearningError onRetry={() => void languages.refetch()} />
        ) : !languages.data.length ? (
          <EmptyState title={t.empty} description={t.hint} />
        ) : (
          <div className={styles.selector}>
            <Select
              label={t.choose}
              value={language || ''}
              onChange={(event) => setSelected(event.target.value)}
            >
              {!language && <option value="">{t.choose}</option>}
              {languages.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {!!language &&
          (path.isPending ? (
            <LearningSkeleton />
          ) : path.isError ? (
            <LearningError onRetry={() => void path.refetch()} />
          ) : (
            <div className={styles.layout}>
              <div>
                {!path.data.courses.length ? (
                  <EmptyState title={t.empty} description={t.hint} />
                ) : (
                  <LearningJourney
                    courses={path.data.courses}
                    placementCompleted={path.data.placement_completed}
                  />
                )}
              </div>
              <Card className={styles.summary}>
                <Sparkles size={28} />
                <h2>{t.current}</h2>
                <strong className={styles.level}>
                  {path.data.level ?? '—'}
                </strong>
                <p>{path.data.placement_completed ? t.ready : t.needed}</p>
                <div className={styles.actions}>
                  {!path.data.placement_completed && (
                    <LinkButton href={'/level-tests/' + language}>
                      {t.placement}
                    </LinkButton>
                  )}
                  {path.data.placement_completed && path.data.level && (
                    <LinkButton
                      href={
                        '/level-tests/' + language + '?level=' + path.data.level
                      }
                    >
                      {t.completion} · {path.data.level}
                    </LinkButton>
                  )}
                </div>
              </Card>
            </div>
          ))}
      </div>
    </LearningShell>
  );
}
