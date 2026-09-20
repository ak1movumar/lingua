'use client';
import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { isLocale, localeNames, locales } from '@/i18n/config';
import { cn } from '@/lib/cn';
import { Select } from './field';
import styles from './preferences.module.scss';
const subscribe = () => () => {};
export function ThemeSwitcher() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const {
    messages: { ui },
  } = useI18n();
  const options = [
    { value: 'light', label: ui.light, Icon: Sun },
    { value: 'dark', label: ui.dark, Icon: Moon },
    { value: 'system', label: ui.system, Icon: Monitor },
  ];
  return (
    <div className={styles.theme} role="group" aria-label={ui.appearance}>
      {options.map(({ value, label, Icon }) => (
        <button
          type="button"
          key={value}
          title={label}
          aria-label={label}
          disabled={!mounted}
          aria-pressed={mounted && theme === value}
          className={cn(
            styles.option,
            mounted && theme === value && styles.active,
          )}
          onClick={() => setTheme(value)}
        >
          <Icon size={17} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
export function LanguageSwitcher() {
  const {
    locale,
    setLocale,
    messages: { ui },
  } = useI18n();
  return (
    <Select
      label={ui.language}
      value={locale}
      onChange={(event) => {
        if (isLocale(event.target.value)) setLocale(event.target.value);
      }}
    >
      {locales.map((value) => (
        <option key={value} value={value}>
          {localeNames[value]}
        </option>
      ))}
    </Select>
  );
}
