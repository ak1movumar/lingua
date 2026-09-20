'use client';
import { useQuery } from '@tanstack/react-query';
import { LearningShell } from '@/features/learning/learning-shell';
import { Avatar, Badge, Card, PageHeader } from '@/components/ui/surface';
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
    locale,
  } = useI18n();
  const user = query.data;
  const created = user ? new Date(user.created_at) : null;
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
            <div className={styles.actions}>
              <Badge>{user.role === 'admin' ? t.admin : t.member}</Badge>
              <Badge tone={user.is_active ? 'success' : 'neutral'}>
                {user.is_active ? t.active : t.inactive}
              </Badge>
            </div>
            <dl>
              <div>
                <dt>{t.username}</dt>
                <dd>{user.username}</dd>
              </div>
              {created && Number.isFinite(created.getTime()) && (
                <div>
                  <dt>{t.joined}</dt>
                  <dd>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'long',
                    }).format(created)}
                  </dd>
                </div>
              )}
            </dl>
            <FriendActions id={user.id} />
          </div>
        </Card>
      )}
    </LearningShell>
  );
}
