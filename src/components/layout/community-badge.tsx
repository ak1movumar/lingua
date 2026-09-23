import Image from 'next/image';
import styles from './community-badge.module.scss';

export function CommunityBadge() {
  return (
    <Image
      className={styles.badge}
      src="/community-logo.jpg"
      alt="COMMUNITY"
      width={112}
      height={112}
    />
  );
}
