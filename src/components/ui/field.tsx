'use client';
import {
  useId,
  useState,
  type ComponentPropsWithRef,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers/i18n-provider';
import { IconButton } from './button';
import styles from './field.module.scss';
type FieldMeta = { label: string; hint?: string; error?: string };
type InputProps = ComponentPropsWithRef<'input'> &
  FieldMeta & { leading?: ReactNode; trailing?: ReactNode };
export function Input({
  label,
  hint,
  error,
  leading,
  trailing,
  id,
  className,
  ...props
}: InputProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={inputId}>{label}</label>
      <div className={cn(styles.control, !!error && styles.invalid)}>
        {leading && <span className={styles.leading}>{leading}</span>}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? inputId + '-help' : undefined}
          {...props}
        />
        {trailing}
      </div>
      {(error || hint) && (
        <span
          id={inputId + '-help'}
          className={cn(styles.help, !!error && styles.error)}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
export function PasswordInput(props: Omit<InputProps, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false);
  const {
    messages: { ui },
  } = useI18n();
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <IconButton
          label={visible ? ui.hidePassword : ui.showPassword}
          disabled={props.disabled}
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </IconButton>
      }
    />
  );
}
export function SearchInput(props: Omit<InputProps, 'type' | 'leading'>) {
  return (
    <Input
      {...props}
      type="search"
      leading={<Search size={18} aria-hidden="true" />}
    />
  );
}
export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldMeta) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={inputId}>{label}</label>
      <textarea
        id={inputId}
        className={cn(styles.textarea, !!error && styles.invalid)}
        aria-invalid={!!error}
        aria-describedby={error || hint ? inputId + '-help' : undefined}
        {...props}
      />
      {(error || hint) && (
        <span
          id={inputId + '-help'}
          className={cn(styles.help, !!error && styles.error)}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
export function Select({
  label,
  hint,
  error,
  id,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldMeta) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={inputId}>{label}</label>
      <select
        className={cn(styles.select, !!error && styles.invalid)}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error || hint ? inputId + '-help' : undefined}
        {...props}
      >
        {children}
      </select>
      {(error || hint) && (
        <span
          id={inputId + '-help'}
          className={cn(styles.help, !!error && styles.error)}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
