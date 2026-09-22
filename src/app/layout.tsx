import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/providers/app-providers';
import { getLocale } from '@/i18n/server';
import { messages } from '@/i18n/messages';
import '@/styles/globals.scss';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#ffffff',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#0c1020',
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Lingora — Learn Languages',
    template: '%s | Lingora',
  },

  description:
    'Learn languages with interactive lessons, exercises, challenges, achievements, progress tracking and a global community.',

  applicationName: 'Lingora',

  keywords: [
    'Lingora',
    'language learning',
    'learn English',
    'learn languages',
    'English lessons',
    'language courses',
    'interactive lessons',
    'language learning platform',
  ],

  authors: [
    {
      name: 'Motion Community',
    },
  ],

  creator: 'Motion Community',
  publisher: 'Lingora',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',
    siteName: 'Lingora',
    title: 'Lingora — Learn Languages',
    description:
      'Learn languages through interactive lessons, challenges, achievements and community.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lingora language learning platform',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Lingora — Learn Languages',
    description:
      'Learn languages through interactive lessons, challenges, achievements and community.',
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
