import Image from 'next/image';
import { cn } from '@/lib/cn';
import styles from './landing.module.scss';

export function LanguageArt({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(styles.art, compact && styles.compactArt)}
      aria-hidden="true"
    >
      <Image
        src="/heroImage.png"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className={styles.heroImage}
      />
    </div>
  );
}
