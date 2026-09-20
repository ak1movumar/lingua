import { LoaderCircle } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './button.module.scss';
export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], styles[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonProps & { label: string }) {
  return (
    <Button
      variant="ghost"
      {...props}
      aria-label={label}
      title={label}
      className={cn(styles.icon, className)}
    >
      {children}
    </Button>
  );
}
