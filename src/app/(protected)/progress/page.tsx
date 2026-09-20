import type { Metadata } from 'next';
import { ProgressPage } from '@/features/progress/progress-page';
export const metadata: Metadata = {
  title: 'Progress',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <ProgressPage />;
}
