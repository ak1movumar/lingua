import Image from 'next/image';
import Link from 'next/link';

import logoImage from '../../../public/logo.png';
import styles from './layout.module.scss';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Lingora" className={styles.logo}>
      <Image
        src={logoImage}
        alt="Lingora"
        width={compact ? 55 : 180}
        height={compact ? 55 : 70}
        priority
        className={styles.logoImage}
      />
    </Link>
  );
}
