'use client';
import { useI18n } from '@/providers/i18n-provider';
import { ErrorState } from '@/components/ui/states';
import { Skeleton } from '@/components/ui/surface';
import styles from './chat.module.scss';
export function ChatLoading() {
  const {
    messages: { messaging: t },
  } = useI18n();
  return (
    <div className={styles.loading} role="status" aria-label={t.loading}>
      {[0, 1, 2].map((id) => (
        <Skeleton key={id} />
      ))}
    </div>
  );
}
export function ChatError({ retry }: { retry: () => void }) {
  const {
    messages: { messaging: t, ui },
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
