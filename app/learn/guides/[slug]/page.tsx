import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getGuide } from '@/lib/learn/db';
import { getCurrentUser, hasPremiumAccess } from '@/lib/auth';
import GuideBlocks from '@/components/learn/GuideBlocks';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await getGuide(slug);
  return { title: g ? `${g.title} — Digitech Learning Hub` : 'מדריך לא נמצא' };
}

export default async function GuideReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide || guide.status !== 'published') notFound();

  if (guide.is_premium) {
    const auth = await getCurrentUser();
    if (!auth) redirect(`/login?return=${encodeURIComponent(`/learn/guides/${slug}`)}`);
    if (!hasPremiumAccess(auth.profile)) {
      redirect(`/upgrade?return=${encodeURIComponent(`/learn/guides/${slug}`)}`);
    }
  }

  const cover = guide.cover_url;

  return (
    <article className="px-6 lg:px-10 py-8 max-w-3xl">
      <Link href="/learn/guides" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה למדריכים
      </Link>

      <header className="mb-8">
        {cover && (
          <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-6 border border-neutral-200">
            <img src={cover} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-neutral-950 mb-3 leading-tight">{guide.title}</h1>
        {guide.tagline && <p className="text-lg text-neutral-600 leading-relaxed">{guide.tagline}</p>}
        {guide.audience && (
          <p className="text-xs text-neutral-500 mt-3 inline-block bg-neutral-100 rounded-pill px-2.5 py-1 font-semibold">
            קהל יעד: {guide.audience}
          </p>
        )}
      </header>

      <GuideBlocks blocks={guide.body} />
    </article>
  );
}
