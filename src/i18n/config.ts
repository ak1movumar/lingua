export const locales = ['ky', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';
export const localeCookie = 'lingua-locale';
export const localeNames: Record<Locale, string> = {
  ky: 'Кыргызча',
  ru: 'Русский',
  en: 'English',
};
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && locales.some((locale) => locale === value)
  );
}
