'use client';
import { ArrowRight, Check, Info } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/providers/i18n-provider';
import { Button, IconButton } from '@/components/ui/button';
import {
  Input,
  PasswordInput,
  SearchInput,
  Textarea,
} from '@/components/ui/field';
import { Card } from '@/components/ui/surface';
import { Tooltip } from '@/components/ui/tooltip';
import styles from './studio.module.scss';
export function Controls({
  onModal,
  onConfirm,
}: {
  onModal: () => void;
  onConfirm: () => void;
}) {
  const {
    messages: { studio: t },
  } = useI18n();
  const [email, setEmail] = useState('');
  const invalid = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <section className={styles.section} id="components">
      <div className={styles.sectionHeading}>
        <span>02</span>
        <div>
          <h2>
            {t.buttons} & {t.fields.toLocaleLowerCase()}
          </h2>
          <p>{t.fieldsHint}</p>
        </div>
      </div>
      <div className={styles.twoColumns}>
        <Card>
          <div className={styles.cardHeading}>
            <h3>{t.buttons}</h3>
            <Tooltip text={t.tooltip}>
              <IconButton label={t.tooltip}>
                <Info size={18} />
              </IconButton>
            </Tooltip>
          </div>
          <p className={styles.muted}>{t.buttonsHint}</p>
          <div className={styles.buttonGrid}>
            <Button onClick={onModal}>
              {t.start}
              <ArrowRight size={17} />
            </Button>
            <Button variant="secondary" onClick={onModal}>
              {t.secondary}
            </Button>
            <Button variant="ghost" onClick={onModal}>
              {t.ghost}
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              {t.danger}
            </Button>
            <Button loading>{t.loading}</Button>
            <Button disabled variant="secondary">
              {t.disabled}
            </Button>
          </div>
          <div className={styles.divider} />
          <div className={styles.buttonSizes}>
            <Button size="sm" onClick={onModal}>
              <Check size={15} />
              {t.continue}
            </Button>
            <Button size="lg" variant="secondary" onClick={onModal}>
              {t.continue}
              <ArrowRight size={18} />
            </Button>
          </div>
        </Card>
        <Card>
          <h3>{t.fields}</h3>
          <div className={styles.fields}>
            <Input
              label={t.name}
              placeholder={t.namePlaceholder}
              autoComplete="off"
            />
            <Input
              type="email"
              label={t.email}
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={invalid ? t.emailError : undefined}
              autoComplete="off"
            />
            <PasswordInput
              label={t.password}
              placeholder="••••••••"
              hint={t.passwordHint}
              autoComplete="new-password"
            />
            <SearchInput label={t.search} placeholder={t.searchPlaceholder} />
            <Textarea label={t.note} placeholder={t.notePlaceholder} rows={2} />
          </div>
        </Card>
      </div>
    </section>
  );
}
