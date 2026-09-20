'use client';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/modal';
import { labels } from '@/i18n/management';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { queryKeys } from '@/constants/query-keys';
import { Card, Badge, Skeleton } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/states';
import {
  getNotifications,
  readNotification,
  readNotifications,
  deleteNotification,
} from './notifications-api';
import { accountError } from './errors';
import styles from './account.module.scss';
export function NotificationsPanel() {
  const { user } = useAuth();
  const {
    messages: { account: t, ui },
    locale,
  } = useI18n();
  const [limit, setLimit] = useState(5);
  const [deleting, setDeleting] = useState<number | null>(null);
  const extra = labels[locale];
  const lock = useRef(false);
  const client = useQueryClient();
  const deletion = useMutation({
    retry: false,
    mutationFn: deleteNotification,
    onSuccess: async () => {
      setDeleting(null);
      await client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
  const query = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ signal }) => getNotifications(user?.id ?? '', signal),
    enabled: !!user,
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: async (id: number | null) => {
      if (id === null) await readNotifications();
      else await readNotification(id);
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.notifications });
      lock.current = false;
    },
  });
  const read = (id: number | null) => {
    if (lock.current || mutation.isPending) return;
    lock.current = true;
    mutation.mutate(id);
  };
  return (
    <Card className={styles.section}>
      <ConfirmDialog
        open={deleting !== null}
        title={extra.confirm}
        description={extra.deleteHint}
        confirmLabel={extra.remove}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting !== null && !deletion.isPending)
            deletion.mutate(deleting);
        }}
        loading={deletion.isPending}
        error={deletion.isError ? extra.error : undefined}
      />
      <h2>
        <Bell size={21} />
        {t.notifications}
      </h2>
      <p>{t.notificationsHint}</p>
      {query.isPending ? (
        <div role="status" aria-label={t.loading}>
          <Skeleton />
          <Skeleton />
        </div>
      ) : query.isError ? (
        <ErrorState
          title={t.loadError}
          description={accountError(query.error, t)}
          onRetry={() => void query.refetch()}
          retryLabel={ui.retry}
        />
      ) : !query.data.length ? (
        <EmptyState
          title={t.noNotifications}
          description={t.noNotificationsHint}
        />
      ) : (
        <>
          <Button
            variant="secondary"
            disabled={!query.data.some((item) => !item.is_read)}
            loading={mutation.isPending}
            onClick={() => read(null)}
          >
            {t.readAll}
          </Button>
          <ul className={styles.notifications}>
            {query.data.slice(0, limit).map((item) => {
              const created = new Date(item.created_at);
              return (
                <li key={item.id}>
                  <div className={styles.actions}>
                    <h3>{item.title}</h3>
                    {!item.is_read && <Badge tone="primary">{t.unread}</Badge>}
                  </div>
                  <p>{item.message}</p>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={deletion.isPending}
                    onClick={() => {
                      deletion.reset();
                      setDeleting(item.id);
                    }}
                  >
                    {extra.remove}
                  </Button>
                  {Number.isFinite(created.getTime()) && (
                    <time dateTime={item.created_at}>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(created)}
                    </time>
                  )}
                  {!item.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={mutation.isPending}
                      onClick={() => read(item.id)}
                    >
                      {t.markRead}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          {query.data.length > limit && (
            <Button variant="ghost" onClick={() => setLimit(limit + 5)}>
              {t.showMore}
            </Button>
          )}
        </>
      )}
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {accountError(mutation.error, t)}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className={styles.success}>
          {t.notificationsSaved}
        </p>
      )}
    </Card>
  );
}
