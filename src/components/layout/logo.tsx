import Link from 'next/link';
import styles from './layout.module.scss';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Lingora" className={styles.logo}>
      <svg
        width="34"
        height="38"
        viewBox="0 0 34 38"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="0"
          y="5"
          width="13"
          height="25"
          rx="6.5"
          transform="rotate(-25 0 5)"
          fill="currentColor"
          opacity=".65"
        />
        <path
          d="M19 6c3-5 11-3 11 3 0 6-9 19-16 25 0-10 1-22 5-28Z"
          fill="currentColor"
        />
      </svg>
      {!compact && (
        <span>
          Lingora<span className={styles.logoDot}>.</span>
        </span>
      )}
    </Link>
  );
}
