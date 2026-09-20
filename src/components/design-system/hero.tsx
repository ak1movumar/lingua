'use client';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import styles from './studio.module.scss';
export function StudioHero({ onPreferences }: { onPreferences: () => void }) {
  const {
    messages: { studio: t },
  } = useI18n();
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>
          <Sparkles size={13} />
          {t.heroLabel}
        </p>
        <h2 id="hero-heading">{t.heroTitle}</h2>
        <p>{t.heroDescription}</p>
        <div className={styles.heroActions}>
          <Button
            onClick={() =>
              document.getElementById('components')?.scrollIntoView()
            }
          >
            {t.explore}
            <ArrowDown size={16} />
          </Button>
          <Button variant="ghost" onClick={onPreferences}>
            {t.appearance}
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
      <div className={styles.art} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.orbitTwo} />
        <div className={styles.globe}>
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="84" />
            <ellipse cx="100" cy="100" rx="40" ry="84" />
            <path d="M16 100h168M28 57h144M28 143h144M100 16v168" />
          </svg>
        </div>
        <span className={styles.bubbleOne}>
          Hello<span>↗</span>
        </span>
        <span className={styles.bubbleTwo}>
          Салам<span>✦</span>
        </span>
        <span className={styles.artSpark}>✧</span>
        <span className={styles.artDot} />
        <span className={styles.artCaption}>a world of words</span>
      </div>
    </section>
  );
}
