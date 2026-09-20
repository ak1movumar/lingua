'use client';
import { useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './tabs.module.scss';
export function Tabs({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: string; label: string; content: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={list} role="tablist" aria-label={label} className={styles.list}>
        {items.map((item, index) => (
          <button
            key={item.value}
            id={id + '-tab-' + item.value}
            role="tab"
            type="button"
            aria-selected={value === item.value}
            aria-controls={id + '-panel-' + item.value}
            tabIndex={value === item.value ? 0 : -1}
            className={cn(styles.tab, value === item.value && styles.active)}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % items.length;
              else if (event.key === 'ArrowLeft')
                next = (index - 1 + items.length) % items.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = items.length - 1;
              else return;
              event.preventDefault();
              const selected = items[next];
              if (selected) {
                onChange(selected.value);
                list.current?.querySelectorAll('button')[next]?.focus();
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          id={id + '-panel-' + item.value}
          role="tabpanel"
          aria-labelledby={id + '-tab-' + item.value}
          hidden={value !== item.value}
          tabIndex={0}
          className={styles.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
