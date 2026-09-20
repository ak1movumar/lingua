import { notFound } from 'next/navigation';
import { CourseDetails } from '@/features/courses/course-details';
import { parseRouteId } from '@/lib/route-id';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseRouteId(id);
  if (courseId === null) notFound();
  return <CourseDetails id={courseId} />;
}
