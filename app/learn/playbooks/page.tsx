import Link from 'next/link';
import { listPlaybooks } from '@/lib/learn/db';
import { BookText } from 'lucide-react';

export const metadata = { title: 'פלייבוקים — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

export default async function PlaybooksLearnerIndex() {
  const items = await listPlaybooks();

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookText className="w-5 h-5 text-brand-purple-700" />
          <span className="text-xs font-extrabold text-brand-purple-700 uppercase tracking-wide">פלייבוקים</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-950 mb-1">מדריכי-פעולה אינטראקטיביים</h1>
        <p className="text-neutral-600">פלייבוקים מובנים על בסיס הקורסים והסרטונים שלנו.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">עדיין אין פלייבוקים זמינים.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/learn/playbooks/${p.id}`}
              className="group bg-white rounded-2xl border border-neutral-200 p-5 hover:border-brand-purple-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-pill bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <BookText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-neutral-950 group-hover:text-brand-purple-700 transition-colors">{p.title}</h3>
              {p.audience && (
                <p className="text-xs text-neutral-500 mt-2">קהל: {p.audience}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
