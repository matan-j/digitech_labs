import Link from 'next/link';
import { listContent, progressByCourse } from '@/lib/learn/db';
import { getCurrentUser, hasPremiumAccess } from '@/lib/auth';
import { ArrowLeft, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'קורסים — Digitech Learning Hub' };

export default async function CoursesIndexPage() {
  const [items, auth] = await Promise.all([listContent('course'), getCurrentUser()]);
  const visible = items.filter((c) => c.status === 'published');
  const canSeePremium = auth ? hasPremiumAccess(auth.profile) : false;
  const progress = auth ? await progressByCourse(auth.userId) : {};

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">קורסים</h1>
        <p className="text-neutral-500 mt-1">
          {visible.length === 0 ? 'אין עדיין קורסים מפורסמים' : `${visible.length} קורסים זמינים`}
        </p>
      </header>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">בדוק שוב בקרוב — קורסים חדשים בדרך.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((c) => {
            const locked = c.is_premium && !canSeePremium;
            const cp = progress[c.id];
            const pct = cp && cp.total > 0 ? Math.round((cp.done / cp.total) * 100) : 0;
            return (
              <Link
                key={c.id}
                href={`/learn/courses/${c.slug}`}
                className="group block bg-white rounded-xl border border-neutral-200 hover:border-brand-purple-300 hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  className={[
                    'aspect-[16/9] relative',
                    c.cover_style === 'header' ? 'bg-brand-purple-900' : 'bg-brand-purple-700',
                  ].join(' ')}
                  style={
                    c.cover_url
                      ? { backgroundImage: `url(${c.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : c.cover_style === 'header'
                        ? { backgroundImage: 'linear-gradient(180deg, #1A0F3D 0%, #3D2678 100%)' }
                        : { backgroundImage: 'linear-gradient(135deg, #2E1A5C 0%, #4A2E8F 60%, #5B3AAE 100%)' }
                  }
                >
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    {c.audience && (
                      <span className="self-start inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-brand-purple-100 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-pill">
                        {c.audience}
                      </span>
                    )}
                    <h3 className="mt-2 text-white font-extrabold text-lg leading-tight line-clamp-2">{c.title}</h3>
                  </div>
                  {locked && (
                    <div className="absolute top-3 right-3 bg-white rounded-pill px-2 py-1 flex items-center gap-1 text-[10px] font-semibold text-brand-purple-800">
                      <Lock className="w-3 h-3" />
                      פרימיום
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {c.tagline && (
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3 min-h-[2.6em]">{c.tagline}</p>
                  )}
                  {cp && cp.total > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                        <span>{cp.done} / {cp.total} שיעורים</span>
                        <span className="font-semibold tabular-nums">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-pill bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-brand-purple-700 rounded-pill transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-end">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple-700 group-hover:text-brand-purple-600 transition-colors">
                      {locked ? 'הצטרף' : pct > 0 ? 'המשך' : 'התחל'}
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
