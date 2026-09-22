'use client';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { labels } from '@/i18n/management';
import { PageHeader } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { Button } from '@/components/ui/button';
import styles from './admin.module.scss';
import { useState } from 'react';
import { LearningShell } from '@/features/learning/learning-shell';
import { resources, type Resource } from './resources';
import { resourceIcons, adminCopy } from './presentation';
import { ResourcePanel } from './resource-panel';
export function AdminPage() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = labels[locale];
  const [resource, setResource] = useState<Resource>('languages');
  return (
    <LearningShell active="settings">
      <div className={styles.page}>
        <PageHeader
          eyebrow="Lingora Studio"
          title={t.admin}
          description={adminCopy[locale].hint}
          action={
            user?.role === 'admin' ? (
              <LinkButton href="/admin/english">English A1–A2</LinkButton>
            ) : undefined
          }
        />
        {user?.role !== 'admin' ? (
          <p>{t.forbidden}</p>
        ) : (
          <div className={styles.workspace}>
            <nav className={styles.nav} aria-label={t.admin}>
              {(Object.keys(resources) as Resource[])
                .filter((key) => key !== 'test-questions')
                .map((key) => {
                  const Icon = resourceIcons[key];
                  return (
                    <Button
                      key={key}
                      variant={resource === key ? 'primary' : 'secondary'}
                      aria-pressed={resource === key}
                      onClick={() => setResource(key)}
                    >
                      <Icon size={18} />
                      <span>{t[key]}</span>
                    </Button>
                  );
                })}
            </nav>
            <div className={styles.content}>
              <ResourcePanel key={resource} resource={resource} />
            </div>
          </div>
        )}
      </div>
    </LearningShell>
  );
}
