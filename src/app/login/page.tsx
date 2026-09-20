import type { Metadata } from 'next';
import { AuthScreen } from '@/features/auth/auth-screen';
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    registered?: string;
    logout?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <AuthScreen
      mode="login"
      next={params.next}
      registered={params.registered === '1'}
      logoutWarning={params.logout === 'local'}
    />
  );
}
