'use client';
import { useState } from 'react';
import { SearchInput } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { useI18n } from '@/providers/i18n-provider';
import { matchesUsername, type Friend } from './contracts';
import { UserCard } from './user-card';
import styles from './social.module.scss';
export function PeopleList({
  users,
  emptyTitle,
  emptyBody,
  hideSearch = false,
}: {
  users: Friend[];
  emptyTitle: string;
  emptyBody: string;
  hideSearch?: boolean;
}) {
  const {
    messages: { social: t, learning },
  } = useI18n();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const filtered = users.filter((user) => matchesUsername(user, search));
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const current = Math.min(page, pages);
  return (
    <section className={styles.list}>
      {!hideSearch && (
        <SearchInput
          label={t.search}
          placeholder={t.searchHint}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      )}
      {!users.length ? (
        <EmptyState title={emptyTitle} description={emptyBody} />
      ) : !filtered.length ? (
        <EmptyState
          title={t.noResults}
          description={t.noResultsBody}
          action={
            <Button variant="secondary" onClick={() => setSearch('')}>
              {t.clear}
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {filtered.slice((current - 1) * 12, current * 12).map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className={styles.pagination} aria-label={learning.page}>
          <Button
            variant="secondary"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            {learning.previous}
          </Button>
          <span>
            {current} / {pages}
          </span>
          <Button
            variant="secondary"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            {learning.next}
          </Button>
        </nav>
      )}
    </section>
  );
}
