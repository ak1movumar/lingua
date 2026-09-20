import type { Metadata } from 'next';
import { DesignSystemStudio } from '@/components/design-system/studio';
export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
};
export default function DesignSystemPage() {
  return <DesignSystemStudio />;
}
