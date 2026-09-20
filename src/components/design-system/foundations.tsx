'use client';
import { useI18n } from '@/providers/i18n-provider';
import { Card } from '@/components/ui/surface';
import styles from './studio.module.scss';
export function Foundations() {
  const {
    messages: { studio: t },
  } = useI18n();
  const colors = [
    { name: t.primary, token: 'primary' },
    { name: t.surface, token: 'surface' },
    { name: t.background, token: 'bg' },
    { name: t.text, token: 'text' },
    { name: t.accent, token: 'info' },
  ];
  return (
    <section className={styles.section} id="foundations">
      <div className={styles.sectionHeading}>
        <span>01</span>
        <div>
          <h2>{t.tokens}</h2>
          <p>{t.tokensHint}</p>
        </div>
      </div>
      <div className={styles.foundations}>
        <Card>
          <div className={styles.swatches}>
            {colors.map((color) => (
              <div className={styles.swatch} key={color.token}>
                <span
                  style={{ background: 'var(--color-' + color.token + ')' }}
                />
                <strong>{color.name}</strong>
                <small>{color.token}</small>
              </div>
            ))}
          </div>
        </Card>
        <Card className={styles.typeCard}>
          <p className={styles.smallLabel}>{t.type}</p>
          <strong>
            Aa<span>Бб</span>
          </strong>
          <h3>{t.typeSample}</h3>
          <p>{t.typeBody}</p>
        </Card>
      </div>
    </section>
  );
}
