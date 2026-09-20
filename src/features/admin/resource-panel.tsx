'use client';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { labels } from '@/i18n/management';
import { Button } from '@/components/ui/button';
import styles from '@/components/ui/collection.module.scss';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';
import { sessionStore } from '@/features/auth/session';
import { Input } from '@/components/ui/field';
import { Card } from '@/components/ui/surface';
import { ConfirmDialog } from '@/components/ui/modal';
import { getResourceRows, type Resource } from './resources';
import { type Row } from './model';
import { ResourceEditor } from './resource-editor';
export function ResourcePanel({ resource }: { resource: Resource }) {
  const { locale } = useI18n();
  const t = labels[locale];
  const { user } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(20);
  const [editor, setEditor] = useState<Row | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const query = useQuery({
    queryKey: ['admin', resource, user?.id],
    queryFn: ({ signal }) => getResourceRows(resource, signal),
    enabled: user?.role === 'admin',
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: async (row: Row) => {
      const generation = sessionStore.getSnapshot().generation;
      await api.delete('/' + resource + '/' + encodeURIComponent(row.id));
      return generation;
    },
    onSuccess: async (generation) => {
      if (generation !== sessionStore.getSnapshot().generation) return;
      setDeleting(null);
      await client.invalidateQueries();
    },
  });
  const filtered = (query.data ?? []).filter((row) =>
    [row.id, row.title, row.name, row.username, row.question, row.email].some(
      (value) =>
        String(value ?? '')
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    ),
  );
  return (
    <section className={styles.page}>
      <h2>{t[resource]}</h2>
      <div className={styles.actions}>
        <Input
          label={t.search}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setLimit(20);
          }}
        />
        {resource !== 'users' && (
          <Button onClick={() => setEditor('new')}>{t.create}</Button>
        )}
      </div>
      {query.isPending ? (
        <p role="status">{t.loading}</p>
      ) : query.isError ? (
        <div role="alert">
          <p>{t.error}</p>
          <Button onClick={() => void query.refetch()}>{t.retry}</Button>
        </div>
      ) : !filtered.length ? (
        <p>{t.empty}</p>
      ) : (
        <div className={styles.grid}>
          {filtered.slice(0, limit).map((row) => (
            <Card key={row.id} className={styles.item}>
              <h3>
                {String(
                  row.title ??
                    row.name ??
                    row.username ??
                    row.question ??
                    row.id,
                )}
              </h3>
              <small>ID: {row.id}</small>
              <dl className={styles.details}>
                {Object.entries(row)
                  .filter(([key]) => key !== 'id' && key !== 'correct_answer')
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{t[key as keyof typeof t] ?? key}</dt>
                      <dd>
                        {typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value ?? '—')}
                      </dd>
                    </div>
                  ))}
              </dl>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => setEditor(row)}>
                  {t.edit}
                </Button>
                <Button
                  variant="danger"
                  disabled={row.id === user?.id}
                  onClick={() => {
                    mutation.reset();
                    setDeleting(row);
                  }}
                >
                  {resource === 'users' ? t.deactivate : t.remove}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {filtered.length > limit && (
        <Button onClick={() => setLimit(limit + 20)}>{t.more}</Button>
      )}
      {editor && (
        <ResourceEditor
          resource={resource}
          row={editor}
          onClose={() => setEditor(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        title={t.confirm}
        description={
          (resource === 'users' ? t.changeHint : t.deleteHint) +
          ' ' +
          String(deleting?.title ?? deleting?.username ?? deleting?.id ?? '')
        }
        confirmLabel={resource === 'users' ? t.deactivate : t.remove}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting && !mutation.isPending) mutation.mutate(deleting);
        }}
        loading={mutation.isPending}
        error={mutation.isError ? t.error : undefined}
      />
    </section>
  );
}
