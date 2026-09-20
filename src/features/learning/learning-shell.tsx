'use client';
import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import type { NavigationKey } from '@/components/layout/navigation';
import { IconButton } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { labels } from '@/i18n/management';
import { useAuth } from '@/features/auth/auth-provider';
import { useLogout } from '@/features/auth/use-logout';
import { useI18n } from '@/providers/i18n-provider';
import styles from './learning.module.scss';
export function LearningShell({
  children,
  active,
}: {
  children: ReactNode;
  active: NavigationKey;
}) {
  const { user } = useAuth();
  const {
    locale,
    messages: { nav, auth },
  } = useI18n();
  const exit = useLogout();
  const extra = labels[locale];
  return (
    <AppShell
      active={active}
      title={nav[active]}
      badge={null}
      identity={
        user ? { name: user.username, description: user.email } : undefined
      }
      action={
        <IconButton
          label={auth.logout}
          disabled={exit.isPending}
          onClick={() => exit.mutate()}
        >
          <LogOut size={18} />
        </IconButton>
      }
    >
      <nav aria-label={extra.overview} className={styles.extraNavigation}>
        <LinkButton href="/achievements" variant="ghost">
          {extra.achievements}
        </LinkButton>
        <LinkButton href="/challenges" variant="ghost">
          {extra.challenges}
        </LinkButton>
        <LinkButton href="/leaderboard" variant="ghost">
          {extra.leaderboard}
        </LinkButton>
        {user?.role === 'admin' && (
          <LinkButton href="/admin" variant="secondary">
            {extra.admin}
          </LinkButton>
        )}
      </nav>
      {children}
    </AppShell>
  );
}
