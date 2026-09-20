'use client';
import { useI18n } from '@/providers/i18n-provider';
import { Card } from '@/components/ui/surface';
import { ErrorState } from '@/components/ui/states';
import { LinkButton } from '@/components/ui/link-button';
import styles from './error.module.scss';
/** Next 16 uses retry to re-fetch and render the failed segment. */
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const {
    messages: { feedback: t, ui },
  } = useI18n();
  return (
    <main id="main-content" className={styles.page}>
      <Card>
        <ErrorState
          title={t.title}
          description={t.body}
          onRetry={retry}
          retryLabel={ui.retry}
        />
        <LinkButton href="/" variant="secondary">
          {t.home}
        </LinkButton>
      </Card>
    </main>
  );
}
