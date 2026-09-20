import { getLocale } from '@/i18n/server';
import { messages } from '@/i18n/messages';
import { EmptyState } from '@/components/ui/states';
import { LinkButton } from '@/components/ui/link-button';
export default async function NotFound() {
  const t = messages[await getLocale()].learning;
  return (
    <main id="main-content">
      <EmptyState
        title={t.notFound}
        description={t.notFoundHint}
        action={<LinkButton href="/courses">{t.backCourses}</LinkButton>}
      />
    </main>
  );
}
