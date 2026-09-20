'use client';
import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { createQueryClient } from '@/lib/query-client';
import type { Locale } from '@/i18n/config';
import { AuthProvider } from '@/features/auth/auth-provider';
import { I18nProvider } from './i18n-provider';
export function AppProviders({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [queryClient] = useState(createQueryClient);
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="lingua-theme"
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={locale}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
