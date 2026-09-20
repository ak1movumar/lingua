'use client';
import { useI18n } from '@/providers/i18n-provider';
import { ErrorState } from '@/components/ui/states';
import { Card, Skeleton } from '@/components/ui/surface';
import styles from './social.module.scss';
export function SocialSkeleton() {
  const {
    messages: { social: t },
  } = useI18n();
  return (
    <div className={styles.grid} role="status" aria-label={t.loading}>
      {[0, 1, 2].map((id) => (
        <Card className={styles.person} key={id}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Card>
      ))}
    </div>
  );
}
export function SocialError({ retry }: { retry: () => void }) {
  const {
    messages: { social: t, ui },
  } = useI18n();
  return (
    <ErrorState
      title={t.errorTitle}
      description={t.errorBody}
      onRetry={retry}
      retryLabel={ui.retry}
    />
  );
}
