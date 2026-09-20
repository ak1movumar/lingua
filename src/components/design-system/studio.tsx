'use client';
import { useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { AppShell } from '@/components/layout/app-shell';
import type { NavigationKey } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Badge, Card, PageHeader } from '@/components/ui/surface';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import { Dropdown } from '@/components/ui/dropdown';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/ui/preferences';
import { StudioHero } from './hero';
import { Foundations } from './foundations';
import { Controls } from './controls';
import { Feedback } from './feedback';
import styles from './studio.module.scss';
export function DesignSystemStudio() {
  const {
    messages: { studio: t, nav, ui },
  } = useI18n();
  const [active, setActive] = useState<NavigationKey>('dashboard');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [tab, setTab] = useState('overview');
  const [confirmed, setConfirmed] = useState(false);
  const navigate = (key: NavigationKey) => {
    setActive(key);
    if (key === 'settings') setPreferences(true);
    else setNavigationOpen(true);
  };
  return (
    <AppShell active={active} onNavigate={navigate}>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        action={<Badge tone="neutral">{t.preview}</Badge>}
      />
      <StudioHero onPreferences={() => setPreferences(true)} />
      <p className={styles.demoNote}>
        <span />
        {t.demo}
      </p>
      <Foundations />
      <Controls
        onModal={() => setDialog(true)}
        onConfirm={() => setConfirm(true)}
      />
      <Feedback />
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <h2>{t.interactions}</h2>
            <p>{t.interactionsHint}</p>
          </div>
        </div>
        <div className={styles.twoColumns}>
          <Card>
            <Tabs
              label={t.interactions}
              value={tab}
              onChange={setTab}
              items={[
                {
                  value: 'overview',
                  label: t.tabOne,
                  content: <p className={styles.tabBody}>{t.tabBodyOne}</p>,
                },
                {
                  value: 'details',
                  label: t.tabTwo,
                  content: <p className={styles.tabBody}>{t.tabBodyTwo}</p>,
                },
                {
                  value: 'states',
                  label: t.tabThree,
                  content: <p className={styles.tabBody}>{t.tabBodyThree}</p>,
                },
              ]}
            />
            <div className={styles.buttonSizes}>
              <Button variant="secondary" onClick={() => setDialog(true)}>
                {t.openModal}
                <ArrowUpRight size={16} />
              </Button>
              <Dropdown
                label={t.more}
                items={[
                  { label: t.openConfirm, onSelect: () => setConfirm(true) },
                  { label: t.appearance, onSelect: () => setPreferences(true) },
                ]}
              />
            </div>
            {confirmed && (
              <p className={styles.success} role="status">
                <CheckCircle2 size={18} />
                {t.confirmed}
              </p>
            )}
          </Card>
          <Card id="preferences">
            <h3>{t.preferences}</h3>
            <p className={styles.muted}>{t.preferencesHint}</p>
            <div className={styles.preferenceGrid}>
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </Card>
        </div>
      </section>
      <p className={styles.notice}>{t.sectionNotice}</p>
      <Modal
        open={dialog}
        onClose={() => setDialog(false)}
        title={t.modalTitle}
        description={t.modalDescription}
        footer={<Button onClick={() => setDialog(false)}>{ui.close}</Button>}
      >
        <p>{t.modalBody}</p>
      </Modal>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          setConfirmed(true);
        }}
        title={t.confirmTitle}
        description={t.confirmDescription}
        confirmLabel={t.danger}
      />
      <Modal
        open={preferences}
        onClose={() => setPreferences(false)}
        title={t.preferences}
        description={t.preferencesHint}
      >
        <div className={styles.preferenceGrid}>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </Modal>
      <Modal
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        title={nav[active]}
        description={nav.soon}
        footer={
          <Button onClick={() => setNavigationOpen(false)}>{ui.close}</Button>
        }
      >
        <Badge>{nav.preview}</Badge>
      </Modal>
    </AppShell>
  );
}
