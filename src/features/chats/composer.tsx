'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { useMessageAction } from './queries';
import { useAuth } from '@/features/auth/auth-provider';
import { sessionDrafts, messageDraftKey } from '@/lib/session-drafts';
import styles from './chat.module.scss';
export function Composer({
  chat,
  onSent,
}: {
  chat: string;
  onSent: () => void;
}) {
  const {
    messages: { messaging: t },
  } = useI18n();
  const { user } = useAuth();
  const key = messageDraftKey(user?.id ?? '', chat);
  const draft = useSyncExternalStore(
    sessionDrafts.subscribe,
    () => sessionDrafts.get(key),
    () => '',
  );
  const setDraft = (value: string) => sessionDrafts.set(key, value);
  const lock = useRef(false);
  const mutation = useMessageAction(chat);
  useEffect(() => {
    if (!draft) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft]);
  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.trim() || lock.current || mutation.isPending) return;
        lock.current = true;
        mutation.mutate(
          { type: 'send', content: draft },
          {
            onSuccess: () => {
              onSent();
            },
            onSettled: () => {
              lock.current = false;
            },
          },
        );
      }}
    >
      <Textarea
        label={t.message}
        placeholder={t.messageHint}
        rows={2}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={mutation.isPending}
      />
      <Button
        type="submit"
        disabled={!draft.trim()}
        loading={mutation.isPending}
      >
        <Send size={18} />
        {t.send}
      </Button>
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {t.sendError}
        </p>
      )}
    </form>
  );
}
