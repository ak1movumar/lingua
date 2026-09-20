import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/providers/app-providers';
import { getLocale } from '@/i18n/server';
import { messages } from '@/i18n/messages';
import '@/styles/globals.scss';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
export const metadata: Metadata = {
  title: { default: 'Lingua', template: '%s | Lingua' },
  description: 'Language learning platform',
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          {messages[locale].common.skip}
        </a>
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
