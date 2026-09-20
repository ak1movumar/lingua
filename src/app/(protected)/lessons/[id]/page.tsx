import { notFound } from 'next/navigation';
import { LessonPage } from '@/features/lessons/lesson-page';
import { parseRouteId } from '@/lib/route-id';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonId = parseRouteId(id);
  if (lessonId === null) notFound();
  return <LessonPage id={lessonId} />;
}
