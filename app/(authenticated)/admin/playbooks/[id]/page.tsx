import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getPlaybook } from '@/lib/learn/db';
import PlaybookEditor from '@/components/learn-admin/PlaybookEditor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPlaybook(id);
  return { title: p ? `${p.title} — עריכה` : 'פלייבוק לא נמצא' };
}

export default async function PlaybookEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playbook = await getPlaybook(id);
  if (!playbook) notFound();

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link href="/admin/playbooks" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לרשימת פלייבוקים
      </Link>
      <PlaybookEditor initial={playbook} />
    </div>
  );
}
