import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import styles from './button.module.scss';
export function LinkButton({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  return (
    <Link
      {...props}
      className={cn(styles.button, styles[variant], styles.md, className)}
    />
  );
}
