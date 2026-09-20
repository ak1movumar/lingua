'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { friendshipMessages } from '@/i18n/friendship';
import { friendshipError } from './errors';
import { Button } from '@/components/ui/button';
import { Avatar, Badge, Card } from '@/components/ui/surface';
import { EmptyState } from '@/components/ui/states';
import { requestsForUser, type FriendRequest } from './contracts';
import {
  requestsOptions,
  useSocialAction,
  userOptions,
  friendsOptions,
} from './queries';
import { SocialError, SocialSkeleton } from './social-state';
import styles from './social.module.scss';
function RequestRow({ request, me }: { request: FriendRequest; me: string }) {
  const incoming = request.receiver_id === me;
  const other = incoming ? request.sender_id : request.receiver_id;
  const person = useQuery(userOptions(other));
  const friends = useQuery(friendsOptions());
  const mutation = useSocialAction(request.id);
  const busy = mutation.isPending;
  const locked = useRef(false);
  const {
    locale,
    messages: { social: t },
  } = useI18n();
  const name = person.data?.username ?? other;
  const respond = (type: 'accept' | 'reject') => {
    if (busy || locked.current) return;
    locked.current = true;
    mutation.mutate(
      { type, id: request.id },
      {
        onSettled: () => {
          locked.current = false;
        },
      },
    );
  };
  return (
    <Card className={styles.request}>
      <Link href={'/users/' + other} className={styles.identity}>
        <Avatar name={person.data?.username ?? '?'} />
        <div>
          <h3>{name}</h3>
          <span>{incoming ? t.incoming : t.outgoing}</span>
        </div>
      </Link>
      <Badge>{request.status}</Badge>
      {incoming &&
        request.status.trim().toLowerCase() === 'pending' &&
        !friends.data?.some((friend) => friend.id === other) && (
          <div className={styles.actions}>
            <Button
              disabled={busy || friends.isPending || mutation.isSuccess}
              loading={
                mutation.isPending && mutation.variables.type === 'accept'
              }
              onClick={() => respond('accept')}
            >
              {t.accept}
            </Button>
            <Button
              variant="secondary"
              loading={
                mutation.isPending && mutation.variables.type === 'reject'
              }
              disabled={busy || friends.isPending || mutation.isSuccess}
              onClick={() => respond('reject')}
            >
              {t.reject}
            </Button>
          </div>
        )}
      {friends.isError && (
        <Button variant="ghost" onClick={() => void friends.refetch()}>
          {t.retryRelations}
        </Button>
      )}
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {friendshipError(mutation.error, friendshipMessages[locale])}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className={styles.muted}>
          {t.actionSuccess}
        </p>
      )}
    </Card>
  );
}
export function RequestsPanel() {
  const [visible, setVisible] = useState(12);
  const { user } = useAuth();
  const query = useQuery(requestsOptions());
  const {
    messages: { social: t },
  } = useI18n();
  const requests = requestsForUser(query.data ?? [], user?.id ?? '');
  return (
    <section className={styles.list} aria-labelledby="requests-title">
      <div>
        <h2 id="requests-title">{t.requests}</h2>
        <p className={styles.muted}>{t.requestsHint}</p>
      </div>
      {query.isPending ? (
        <SocialSkeleton />
      ) : query.isError ? (
        <SocialError retry={() => void query.refetch()} />
      ) : requests.length === 0 ? (
        <EmptyState title={t.noRequests} description={t.noRequestsBody} />
      ) : (
        requests
          .slice(0, visible)
          .map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              me={user?.id ?? ''}
            />
          ))
      )}
      {requests.length > visible && (
        <Button variant="secondary" onClick={() => setVisible(visible + 12)}>
          {t.more}
        </Button>
      )}
    </section>
  );
}
