import type { Metadata } from 'next';
import { CoursesPage } from '@/features/courses/courses-page';
export const metadata: Metadata = {
  title: 'Courses',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CoursesPage />;
}
