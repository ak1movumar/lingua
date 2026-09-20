'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import {
  Avatar,
  Badge,
  Card,
  ProgressBar,
  Skeleton,
} from '@/components/ui/surface';
import { EmptyState, ErrorState } from '@/components/ui/states';
import styles from './studio.module.scss';
export function Feedback() {
  const {
    messages: { studio: t, ui },
  } = useI18n();
  const [retried, setRetried] = useState(false);
  const [progress, setProgress] = useState(64);
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <span>03</span>
        <div>
          <h2>{t.feedback}</h2>
          <p>{t.feedbackHint}</p>
        </div>
      </div>
      <div className={styles.twoColumns}>
        <Card>
          <div className={styles.badges}>
            <Badge tone="success">{t.success}</Badge>
            <Badge tone="warning">{t.pending}</Badge>
            <Badge tone="primary">{t.new}</Badge>
            <Badge tone="danger">{t.error}</Badge>
          </div>
          <div className={styles.progressLabels}>
            <strong>{t.progress}</strong>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} label={t.progress} />
          <label className={styles.rangeLabel}>
            {t.progressHint}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(event) => setProgress(Number(event.target.value))}
            />
          </label>
          <div className={styles.divider} />
          <div className={styles.avatarRow}>
            <Avatar name="Lingua" size="lg" />
            <Avatar name="Lingua" />
            <Avatar name="Lingua" size="sm" />
          </div>
          <div
            className={styles.skeletonCard}
            role="status"
            aria-label={t.loadingLabel}
          >
            <Skeleton className={styles.skeletonAvatar} />
            <div>
              <Skeleton />
              <Skeleton className={styles.shortSkeleton} />
              <Skeleton />
            </div>
          </div>
        </Card>
        <Card>
          <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
          <div className={styles.divider} />
          {retried ? (
            <div className={styles.success} role="status">
              <CheckCircle2 size={24} />
              <p>{t.retried}</p>
            </div>
          ) : (
            <ErrorState
              title={t.errorTitle}
              description={t.errorDescription}
              retryLabel={ui.retry}
              onRetry={() => setRetried(true)}
            />
          )}
        </Card>
      </div>
    </section>
  );
}
