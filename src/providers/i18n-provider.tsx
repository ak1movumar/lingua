'use client';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { isLocale, localeCookie, type Locale } from '@/i18n/config';
import { messages } from '@/i18n/messages';
import type { Messages } from '@/i18n/messages/ru';
type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
};
const I18nContext = createContext<I18nContextValue | null>(null);
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const router = useRouter();
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages: messages[locale],
      setLocale(next) {
        if (!isLocale(next)) return;
        document.cookie =
          localeCookie +
          '=' +
          next +
          '; Path=/; Max-Age=31536000; SameSite=Lax' +
          (location.protocol === 'https:' ? '; Secure' : '');
        document.documentElement.lang = next;
        updateLocale(next);
        router.refresh();
      },
    }),
    [locale, router],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n requires I18nProvider');
  return context;
}
