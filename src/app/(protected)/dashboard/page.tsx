import type { Metadata } from 'next';
import { DashboardPage } from '@/features/learning/dashboard-page';
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <DashboardPage />;
}
