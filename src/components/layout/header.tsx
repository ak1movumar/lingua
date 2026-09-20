'use client';
import { Menu, Palette } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '@/providers/i18n-provider';
import { IconButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/surface';
import { Logo } from './logo';
import styles from './layout.module.scss';
export function Header({
  onMenu,
  onPreferences,
  title,
  badge,
  action,
}: {
  onMenu: () => void;
  onPreferences: () => void;
  title?: string;
  badge?: string | null;
  action?: ReactNode;
}) {
  const {
    messages: { nav, studio, ui },
  } = useI18n();
  return (
    <header className={styles.header}>
      <div className={styles.mobileBrand}>
        <Logo />
      </div>
      <span className={styles.breadcrumb}>{title ?? studio.preview}</span>
      <div className={styles.headerActions}>
        {badge !== null && (
          <Badge tone="primary">{badge ?? studio.status}</Badge>
        )}
        {action}
        <IconButton label={ui.appearance} onClick={onPreferences}>
          <Palette size={20} />
        </IconButton>
        <div className={styles.menuButton}>
          <IconButton label={nav.menu} onClick={onMenu}>
            <Menu size={21} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
