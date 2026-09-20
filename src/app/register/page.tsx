import type { Metadata } from 'next';
import { AuthScreen } from '@/features/auth/auth-screen';
export const metadata: Metadata = {
  title: 'Create account',
  robots: { index: false, follow: false },
};
export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}
