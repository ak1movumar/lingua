'use client';
import { useState } from 'react';
import {
  Pencil,
  UsersRound,
  ChartNoAxesCombined,
  Settings2,
} from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { LearningShell } from '@/features/learning/learning-shell';
import { useI18n } from '@/providers/i18n-provider';
import { Avatar, Badge, Card, PageHeader } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { EditProfile } from './edit-profile';
import styles from './account.module.scss';
export function ProfilePage() {
  const { user } = useAuth();
  const {
    messages: { account: t, social },
    locale,
  } = useI18n();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!user) return null;
  const joined = new Date(user.created_at);
  return (
    <LearningShell active="profile">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.profile}
        description={t.profileHint}
        action={
          <Button
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
          >
            <Pencil size={17} />
            {t.editProfile}
          </Button>
        }
      />
      {saved && (
        <p className={styles.success} role="status">
          {t.profileSaved}
        </p>
      )}
      <div className={styles.profileGrid}>
        <Card className={styles.profileCard}>
          <div className={styles.cover} aria-hidden="true" />
          <div className={styles.profileBody}>
            <Avatar name={user.username} size="lg" />
            <h2>{user.username}</h2>
            <div className={styles.actions}>
              <Badge tone="primary">
                {user.role === 'admin' ? social.admin : social.member}
              </Badge>
              <Badge tone={user.is_active ? 'success' : 'neutral'}>
                {user.is_active ? social.active : social.inactive}
              </Badge>
            </div>
            <dl className={styles.details}>
              <div>
                <dt>{t.username}</dt>
                <dd>{user.username}</dd>
              </div>
              <div>
                <dt>{t.email}</dt>
                <dd>{user.email}</dd>
              </div>
              {Number.isFinite(joined.getTime()) && (
                <div>
                  <dt>{t.joined}</dt>
                  <dd>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'long',
                    }).format(joined)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </Card>
        <aside className={styles.shortcuts}>
          <Card className={styles.section}>
            <h2>{t.yourSpace}</h2>
            <p>{t.yourSpaceHint}</p>
            <LinkButton variant="secondary" href="/friends">
              <UsersRound size={18} />
              {t.friends}
            </LinkButton>
            <LinkButton variant="secondary" href="/progress">
              <ChartNoAxesCombined size={18} />
              {t.progress}
            </LinkButton>
            <LinkButton variant="secondary" href="/settings">
              <Settings2 size={18} />
              {t.settings}
            </LinkButton>
          </Card>
        </aside>
      </div>
      {editing && (
        <EditProfile
          user={user}
          onClose={() => setEditing(false)}
          onSaved={() => setSaved(true)}
        />
      )}
    </LearningShell>
  );
}
