'use client';
import { useQuery } from '@tanstack/react-query';
import { LearningShell } from '@/features/learning/learning-shell';
import { PageHeader } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { useI18n } from '@/providers/i18n-provider';
import { friendsOptions } from './queries';
import { SocialError, SocialSkeleton } from './social-state';
import { PeopleList } from './people-list';
import { RequestsPanel } from './requests-panel';
// import { AddFriend } from './add-friend';
import styles from './social.module.scss';
export function FriendsPage() {
  const query = useQuery(friendsOptions());
  const {
    messages: { social: t },
  } = useI18n();
  return (
    <LearningShell active="friends">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.friends}
        description={t.friendsHint}
        action={
          <LinkButton variant="secondary" href="/community">
            {t.findPeople}
          </LinkButton>
        }
      />
      <div className={styles.sections}>
        {/* <AddFriend /> */}
        {query.isPending ? (
          <SocialSkeleton />
        ) : query.isError ? (
          <SocialError retry={() => void query.refetch()} />
        ) : (
          <PeopleList
            users={query.data}
            emptyTitle={t.noFriends}
            emptyBody={t.noFriendsBody}
          />
        )}
        <RequestsPanel />
      </div>
    </LearningShell>
  );
}
