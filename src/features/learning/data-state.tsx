'use client';
import { useI18n } from '@/providers/i18n-provider';
import { Card, Skeleton } from '@/components/ui/surface';
import { ErrorState } from '@/components/ui/states';
import styles from './learning.module.scss';
export function LearningSkeleton() {
  const {
    messages: { learning: t },
  } = useI18n();
  return (
    <div className={styles.skeletons} role="status" aria-label={t.loading}>
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Card>
      ))}
    </div>
  );
}
export function LearningError({ onRetry }: { onRetry: () => void }) {
  const {
    messages: { learning: t, ui },
  } = useI18n();
  return (
    <Card>
      <ErrorState
        title={t.errorTitle}
        description={t.errorBody}
        retryLabel={ui.retry}
        onRetry={onRetry}
      />
    </Card>
  );
}
