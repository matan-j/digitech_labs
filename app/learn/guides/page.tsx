import Link from 'next/link';
import { listContent } from '@/lib/learn/db';
import { Compass, Lock } from 'lucide-react';
import { getCurrentUser, hasPremiumAccess } from '@/lib/auth';

export const metadata = { title: 'מדריכים — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

export default async function GuidesIndex() {
  const [guides, auth] = await Promise.all([listContent('guide'), getCurrentUser()]);
  const visible = guides.filter((g) => g.status === 'published');
  const canSeePremium = auth ? hasPremiumAccess(auth.profile) : false;

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-brand-purple-700" />
          <span className="text-xs font-extrabold text-brand-purple-700 uppercase tracking-wide">מדריכים</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-950 mb-1">למידה עצמאית</h1>
        <p className="text-neutral-600">מדריכים מפורטים על נושאים ספציפיים — קריאה במקום צפייה.</p>
      </header>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">עדיין אין מדריכים מפורסמים. בדוק שוב בקרוב.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((g) => (
            <GuideCard
              key={g.id}
              guide={g}
              locked={g.is_premium && !canSeePremium}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GuideCard({ guide, locked }: { guide: { id: string; slug: string; title: string; tagline: string | null; cover_url: string | null; tags: string[]; is_premium: boolean }; locked: boolean }) {
  const inner = (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-brand-purple-300 transition-colors h-full flex flex-col">
      <div
        className="aspect-[16/9] bg-gradient-to-br from-brand-purple-200 to-brand-purple-50 relative"
        style={guide.cover_url ? { backgroundImage: `url(${guide.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/40">
            <div className="bg-white rounded-pill px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-purple-800">
              <Lock className="w-3.5 h-3.5" />
              פרימיום
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-extrabold text-neutral-950 group-hover:text-brand-purple-700 transition-colors mb-1">{guide.title}</h3>
        {guide.tagline && <p className="text-sm text-neutral-600 line-clamp-2">{guide.tagline}</p>}
      </div>
    </div>
  );
  return (
    <Link href={`/learn/guides/${guide.slug}`} className="group block h-full">
      {inner}
    </Link>
  );
}
