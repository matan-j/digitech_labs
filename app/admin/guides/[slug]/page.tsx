import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getGuide } from '@/lib/learn/db';
import GuideEditor from '@/components/learn-admin/GuideEditor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await getGuide(slug);
  return { title: g ? `${g.title} — עריכה` : 'מדריך לא נמצא' };
}

export default async function GuideEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link href="/admin/guides" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לרשימת מדריכים
      </Link>
      <GuideEditor initial={guide} />
    </div>
  );
}
