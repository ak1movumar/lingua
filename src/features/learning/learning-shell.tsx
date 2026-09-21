'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, Route, Medal, Flame, Trophy, Settings2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import type { NavigationKey } from '@/components/layout/navigation';
import { IconButton } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { labels } from '@/i18n/management';
import { placementMessages } from '@/i18n/placement';
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
  const pathname = usePathname();
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
        <LinkButton
          href="/learning-path"
          variant="ghost"
          aria-current={pathname === '/learning-path' ? 'page' : undefined}
        >
          <Route size={16} />
          {placementMessages[locale].title}
        </LinkButton>
        <LinkButton
          href="/achievements"
          variant="ghost"
          aria-current={pathname === '/achievements' ? 'page' : undefined}
        >
          <Medal size={16} />
          {extra.achievements}
        </LinkButton>
        <LinkButton
          href="/challenges"
          variant="ghost"
          aria-current={pathname === '/challenges' ? 'page' : undefined}
        >
          <Flame size={16} />
          {extra.challenges}
        </LinkButton>
        <LinkButton
          href="/leaderboard"
          variant="ghost"
          aria-current={pathname === '/leaderboard' ? 'page' : undefined}
        >
          <Trophy size={16} />
          {extra.leaderboard}
        </LinkButton>
        {user?.role === 'admin' && (
          <LinkButton
            href="/admin"
            variant="ghost"
            aria-current={pathname === '/admin' ? 'page' : undefined}
          >
            <Settings2 size={16} />
            {extra.admin}
          </LinkButton>
        )}
      </nav>
      {children}
    </AppShell>
  );
}
