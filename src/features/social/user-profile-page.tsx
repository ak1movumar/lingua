'use client';
import { useQuery } from '@tanstack/react-query';
import { LearningShell } from '@/features/learning/learning-shell';
import { Avatar, Card, PageHeader } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { useI18n } from '@/providers/i18n-provider';
import { userOptions } from './queries';
import { SocialError, SocialSkeleton } from './social-state';
import { FriendActions } from './friend-actions';
import styles from './social.module.scss';
export function UserProfilePage({ id }: { id: string }) {
  const query = useQuery(userOptions(id));
  const {
    messages: { social: t },
  } = useI18n();
  const user = query.data;
  return (
    <LearningShell active="community">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.profile}
        action={
          <LinkButton variant="secondary" href="/community">
            {t.back}
          </LinkButton>
        }
      />
      {query.isPending ? (
        <SocialSkeleton />
      ) : query.isError || !user ? (
        <SocialError retry={() => void query.refetch()} />
      ) : (
        <Card className={styles.profile}>
          <div className={styles.profileCover} aria-hidden="true" />
          <div className={styles.profileBody}>
            <Avatar name={user.username} size="lg" />
            <h2>{user.username}</h2>
            <dl>
              <div>
                <dt>{t.username}</dt>
                <dd>{user.username}</dd>
              </div>
            </dl>
            <FriendActions id={user.id} username={user.username} />
          </div>
        </Card>
      )}
    </LearningShell>
  );
}
