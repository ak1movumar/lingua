'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, useDeferredValue } from 'react';
import { SearchInput } from '@/components/ui/field';
import { UsersRound } from 'lucide-react';
import { getApiFailure } from '@/services/api/errors';
import { friendshipMessages } from '@/i18n/friendship';
import { LearningShell } from '@/features/learning/learning-shell';
import { PageHeader } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { useI18n } from '@/providers/i18n-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { usersOptions } from './queries';
import { SocialError, SocialSkeleton } from './social-state';
import { PeopleList } from './people-list';
import styles from './social.module.scss';
export function CommunityPage() {
  const [search, setSearch] = useState('');
  const query = useQuery(usersOptions(useDeferredValue(search.trim())));
  const { user } = useAuth();
  const {
    locale,
    messages: { social: t },
  } = useI18n();
  return (
    <LearningShell active="community">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.community}
        description={t.communityHint}
        action={
          <LinkButton variant="secondary" href="/friends">
            <UsersRound size={18} />
            {t.friends}
          </LinkButton>
        }
      />
      <div className={styles.banner}>
        <UsersRound size={36} aria-hidden="true" />
        <div>
          <h2>{t.bannerTitle}</h2>
          <p>{t.bannerBody}</p>
        </div>
      </div>
      <SearchInput
        label={t.search}
        placeholder={t.searchHint}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {query.isPending ? (
        <SocialSkeleton />
      ) : query.isError ? (
        getApiFailure(query.error).status === 403 ? (
          <p role="status">{friendshipMessages[locale].directory}</p>
        ) : (
          <SocialError retry={() => void query.refetch()} />
        )
      ) : (
        <PeopleList
          hideSearch
          users={query.data.filter((person) => person.id !== user?.id)}
          emptyTitle={t.noUsers}
          emptyBody={t.noUsersBody}
        />
      )}
    </LearningShell>
  );
}
