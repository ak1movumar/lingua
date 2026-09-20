'use client';
import { useRef, useState } from 'react';
import { UserPlus, UserMinus, Check } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Badge } from '@/components/ui/surface';
import { ConfirmDialog } from '@/components/ui/modal';
import { useI18n } from '@/providers/i18n-provider';
import { friendshipMessages } from '@/i18n/friendship';
import { friendshipError } from './errors';
import { pendingRequest } from './contracts';
import {
  useRelationships,
  useSocialAction,
  type SocialAction,
} from './queries';
import styles from './social.module.scss';
export function FriendActions({
  id,
  showMessage = true,
}: {
  id: string;
  showMessage?: boolean;
}) {
  const { user } = useAuth();
  const {
    locale,
    messages: { social: t },
  } = useI18n();
  const text = friendshipMessages[locale];
  const { friends, requests } = useRelationships();
  const mutation = useSocialAction(id);
  const busy = mutation.isPending;
  const locked = useRef(false);
  const [confirm, setConfirm] = useState(false);
  const friend = friends.data?.some((item) => item.id === id);
  const pending = pendingRequest(requests.data ?? [], user?.id ?? '', id);
  const incoming = pending?.receiver_id === user?.id;
  const sent = pending && !incoming;
  const related =
    requests.data?.filter(
      (item) =>
        (item.sender_id === id && item.receiver_id === user?.id) ||
        (item.receiver_id === id && item.sender_id === user?.id),
    ) ?? [];
  const run = (action: SocialAction) => {
    if (busy || locked.current) return;
    locked.current = true;
    mutation.mutate(action, {
      onSuccess: () => setConfirm(false),
      onSettled: () => {
        locked.current = false;
      },
    });
  };
  if (user?.id === id) return <Badge>{t.you}</Badge>;
  return (
    <div className={styles.relationship}>
      {showMessage && (
        <LinkButton
          href={'/chats?to=' + encodeURIComponent(id)}
          variant="secondary"
        >
          {t.message}
        </LinkButton>
      )}
      {friend ? (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            mutation.reset();
            setConfirm(true);
          }}
        >
          <UserMinus size={16} />
          {t.remove}
        </Button>
      ) : pending && incoming ? (
        <>
          <Badge>{text.incoming}</Badge>
          <Button
            disabled={busy}
            onClick={() => run({ type: 'accept', id: pending.id })}
          >
            {t.accept}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => run({ type: 'reject', id: pending.id })}
          >
            {t.reject}
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          disabled={
            !user ||
            friends.isPending ||
            requests.isPending ||
            !!sent ||
            busy ||
            (mutation.isSuccess && mutation.variables.type === 'send')
          }
          loading={mutation.isPending && mutation.variables.type === 'send'}
          onClick={() => run({ type: 'send', id })}
        >
          <UserPlus size={16} />
          {sent ? text.pending : t.add}
        </Button>
      )}
      {friend && (
        <Badge tone="success">
          <Check size={12} /> {t.friend}
        </Badge>
      )}
      {!friend && related.length > 0 && (
        <span className={styles.muted}>
          {t.requestStatus}: {related.map((item) => item.status).join(', ')}
        </span>
      )}
      {(friends.isError || requests.isError) && (
        <Button
          variant="ghost"
          onClick={() => {
            void friends.refetch();
            void requests.refetch();
          }}
        >
          {t.retryRelations}
        </Button>
      )}
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {friendshipError(mutation.error, text)}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className={styles.muted}>
          {mutation.variables.type === 'send' ? text.sent : t.actionSuccess}
        </p>
      )}
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => run({ type: 'remove', id })}
        title={t.removeTitle}
        description={t.removeBody}
        confirmLabel={t.remove}
        error={
          mutation.isError ? friendshipError(mutation.error, text) : undefined
        }
        loading={busy}
      />
    </div>
  );
}
