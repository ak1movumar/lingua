import { notFound } from 'next/navigation';
import { TestPage } from '@/features/placement/test-page';
import { levelSchema } from '@/features/placement/contracts';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ level?: string }>;
}) {
  const { id } = await params;
  const { level } = await searchParams;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const parsed = level === undefined ? undefined : levelSchema.safeParse(level);
  if (parsed && !parsed.success) notFound();
  return (
    <TestPage
      key={id + (level ?? '')}
      language={Number(id)}
      level={parsed?.success ? parsed.data : undefined}
    />
  );
}
