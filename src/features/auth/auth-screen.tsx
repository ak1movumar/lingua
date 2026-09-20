'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { IconButton } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ThemeSwitcher, LanguageSwitcher } from '@/components/ui/preferences';
import { useI18n } from '@/providers/i18n-provider';
import { LoginForm, RegisterForm } from './auth-form';
import { LanguageArt } from '@/features/landing/language-art';
import styles from './auth.module.scss';
export function AuthScreen({
  mode,
  next,
  registered,
  logoutWarning,
}: {
  mode: 'login' | 'register';
  next?: string;
  registered?: boolean;
  logoutWarning?: boolean;
}) {
  const {
    messages: { auth: t, landing },
  } = useI18n();
  const [preferences, setPreferences] = useState(false);
  return (
    <main id="main-content" className={styles.screen}>
      <aside className={styles.brand}>
        <Logo />
        <div className={styles.brandCopy}>
          <p className={styles.eyebrow}>
            <Sparkles size={14} />
            {t.brandLabel}
          </p>
          <h2>{t.brandTitle}</h2>
          <p>{t.brandDescription}</p>
          <LanguageArt compact />
        </div>
        <p className={styles.brandFoot}>Lingua · {landing.footer}</p>
      </aside>
      <section className={styles.formSide}>
        <header>
          <Link href="/">
            <ArrowLeft size={17} />
            {t.back}
          </Link>
          <IconButton
            label={landing.preferences}
            onClick={() => setPreferences(true)}
          >
            <SlidersHorizontal size={19} />
          </IconButton>
        </header>
        <div className={styles.formPanel}>
          <div className={styles.mobileLogo}>
            <Logo />
          </div>
          <p className={styles.eyebrow}>LINGUA</p>
          <h1>{mode === 'login' ? t.loginTitle : t.registerTitle}</h1>
          <p className={styles.description}>
            {mode === 'login' ? t.loginDescription : t.registerDescription}
          </p>
          {mode === 'login' ? (
            <LoginForm
              next={next}
              registered={registered}
              logoutWarning={logoutWarning}
            />
          ) : (
            <RegisterForm />
          )}
        </div>
      </section>
      <Modal
        open={preferences}
        onClose={() => setPreferences(false)}
        title={landing.preferences}
      >
        <div className={styles.form}>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </Modal>
    </main>
  );
}
