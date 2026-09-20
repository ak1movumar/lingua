'use client';
import { useState } from 'react';
import { Menu, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Logo } from '@/components/layout/logo';
import { IconButton } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Modal } from '@/components/ui/modal';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/ui/preferences';
import { useAuth } from '@/features/auth/auth-provider';
import styles from './landing.module.scss';
export function PublicHeader() {
  const {
    messages: { landing: t, nav },
  } = useI18n();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const links = [
    { href: '#features', label: t.features },
    { href: '#courses', label: t.courses },
    { href: '#community', label: t.community },
    { href: '#about', label: t.about },
  ];
  return (
    <>
      <header className={styles.header}>
        <Logo />
        <nav className={styles.desktopNav} aria-label={nav.navigation}>
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <IconButton
            label={t.preferences}
            onClick={() => setPreferences(true)}
          >
            <SlidersHorizontal size={18} />
          </IconButton>
          {user ? (
            <LinkButton href="/dashboard" className={styles.headerStart}>
              {nav.dashboard}
            </LinkButton>
          ) : (
            <>
              <LinkButton
                href="/login"
                variant="ghost"
                className={styles.headerLogin}
              >
                {t.login}
              </LinkButton>
              <LinkButton href="/register" className={styles.headerStart}>
                {t.start}
              </LinkButton>
            </>
          )}
          <span className={styles.menuButton}>
            <IconButton label={nav.menu} onClick={() => setMenu(true)}>
              <Menu size={21} />
            </IconButton>
          </span>
        </div>
      </header>
      <Modal open={menu} onClose={() => setMenu(false)} title={nav.navigation}>
        <nav className={styles.mobileMenu}>
          {links.map((link) => (
            <a href={link.href} key={link.href} onClick={() => setMenu(false)}>
              {link.label}
            </a>
          ))}
          {user ? (
            <LinkButton href="/dashboard" onClick={() => setMenu(false)}>
              {nav.dashboard}
            </LinkButton>
          ) : (
            <>
              <LinkButton
                href="/login"
                variant="secondary"
                onClick={() => setMenu(false)}
              >
                {t.login}
              </LinkButton>
              <LinkButton href="/register" onClick={() => setMenu(false)}>
                {t.start}
              </LinkButton>
            </>
          )}
        </nav>
      </Modal>
      <Modal
        open={preferences}
        onClose={() => setPreferences(false)}
        title={t.preferences}
      >
        <div className={styles.preferences}>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </Modal>
    </>
  );
}
