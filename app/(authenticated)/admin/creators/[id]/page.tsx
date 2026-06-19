import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getCreatorById } from '@/lib/learn/db';
import { createServiceClient } from '@/lib/supabase/server';
import CreatorEditor from '@/components/learn-admin/CreatorEditor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCreatorById(id);
  return { title: c ? `${c.name} — עריכת יוצר` : 'יוצר לא נמצא' };
}

export default async function CreatorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  const admin = createServiceClient();
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 200 });
  const users = (authData?.users ?? []).map((u) => ({ id: u.id, email: u.email ?? null }));

  return (
    <div className="px-8 py-8 max-w-3xl">
      <Link href="/admin/creators" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה ליוצרים
      </Link>
      <CreatorEditor initial={creator} users={users} />
    </div>
  );
}
