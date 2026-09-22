'use client';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { labels } from '@/i18n/management';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { LearningSkeleton } from '@/features/learning/data-state';
import { Button } from '@/components/ui/button';
import styles from './admin.module.scss';
import { Plus, Pencil, Trash2, ArrowLeft, ListChecks } from 'lucide-react';
import { resourceIcons, adminCopy } from './presentation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';
import { sessionStore } from '@/features/auth/session';
import { SearchInput } from '@/components/ui/field';
import { Card, Badge } from '@/components/ui/surface';
import { ConfirmDialog } from '@/components/ui/modal';
import { getResourceRows, resourceItemPath, type Resource } from './resources';
import { type Row } from './model';
import { ResourceEditor } from './resource-editor';
export function ResourcePanel({
  resource,
  parentTest,
}: {
  resource: Resource;
  parentTest?: string;
}) {
  const { locale } = useI18n();
  const t = labels[locale];
  const copy = adminCopy[locale];
  const Icon = resourceIcons[resource];
  const { user } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(20);
  const [editor, setEditor] = useState<Row | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [test, setTest] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['admin', resource, user?.id, parentTest],
    queryFn: ({ signal }) => getResourceRows(resource, signal, parentTest),
    enabled: user?.role === 'admin',
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: async (row: Row) => {
      const generation = sessionStore.getSnapshot().generation;
      await api.delete(resourceItemPath(resource, row.id));
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
  if (resource === 'level-tests' && test)
    return (
      <div className={styles.panel}>
        <Button variant="ghost" onClick={() => setTest(null)}>
          <ArrowLeft size={16} />
          {copy.back}
        </Button>
        <ResourcePanel key={test} resource="test-questions" parentTest={test} />
      </div>
    );
  return (
    <section className={styles.page}>
      <header className={styles.panelHeader}>
        <span className={styles.resourceIcon}>
          <Icon size={24} />
        </span>
        <div>
          <h2>{t[resource]}</h2>
          <p>
            {copy.records}: {query.data?.length ?? '—'}
            {parentTest ? ` · #${parentTest}` : ''}
          </p>
        </div>
      </header>
      <div className={styles.toolbar}>
        <SearchInput
          label={t.search}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setLimit(20);
          }}
        />
        {resource !== 'users' && (
          <Button onClick={() => setEditor('new')}>
            <Plus size={18} />
            {t.create}
          </Button>
        )}
      </div>
      {query.isPending ? (
        <LearningSkeleton />
      ) : query.isError ? (
        <ErrorState
          title={t.error}
          description={t[resource]}
          retryLabel={t.retry}
          onRetry={() => void query.refetch()}
        />
      ) : !filtered.length ? (
        <EmptyState title={t.empty} description={t[resource]} />
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
              <div className={styles.recordMeta}>
                <Badge>#{row.id}</Badge>
                {row.level != null && (
                  <Badge tone="primary">{String(row.level)}</Badge>
                )}
                {typeof row.is_active === 'boolean' && (
                  <Badge tone={row.is_active ? 'success' : 'neutral'}>
                    {t.active}: {row.is_active ? copy.yes : copy.no}
                  </Badge>
                )}
              </div>
              <details className={styles.recordDetails}>
                <summary>{copy.details}</summary>
                <dl className={styles.details}>
                  {Object.entries(row)
                    .filter(([key]) => key !== 'id' && key !== 'correct_answer')
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{t[key as keyof typeof t] ?? key}</dt>
                        <dd>
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : typeof value === 'boolean'
                              ? value
                                ? copy.yes
                                : copy.no
                              : String(value ?? '—')}
                        </dd>
                      </div>
                    ))}
                </dl>
              </details>
              <div className={styles.actions}>
                {resource === 'level-tests' && (
                  <Button
                    variant="secondary"
                    onClick={() => setTest(String(row.id))}
                  >
                    <ListChecks size={16} />
                    {t['test-questions']}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setEditor(row)}>
                  <Pencil size={16} />
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
                  <Trash2 size={16} />
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
          parentTest={parentTest}
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
