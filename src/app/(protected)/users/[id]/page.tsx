import { notFound } from 'next/navigation';
import { z } from 'zod';
import { UserProfilePage } from '@/features/social/user-profile-page';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <UserProfilePage id={id.toLowerCase()} />;
}
