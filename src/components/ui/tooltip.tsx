'use client';
import { useId, useState, type ReactElement, cloneElement } from 'react';
import styles from './tooltip.module.scss';
export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: ReactElement<{ 'aria-describedby'?: string }>;
}) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  return (
    <span
      className={styles.root}
      onMouseEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDismissed(true);
      }}
    >
      {cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id]
          .filter(Boolean)
          .join(' '),
      })}
      <span
        id={id}
        role="tooltip"
        className={styles.tip}
        data-dismissed={dismissed}
      >
        {text}
      </span>
    </span>
  );
}
