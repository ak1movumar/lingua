import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ChatsPage } from '@/features/chats/chats-page';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <ChatsPage id={id.toLowerCase()} />;
}
