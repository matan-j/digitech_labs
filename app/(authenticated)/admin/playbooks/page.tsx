import Link from 'next/link';
import { listPlaybooks } from '@/lib/learn/db';
import { BookText, Plus } from 'lucide-react';
import PlaybookRow from './PlaybookRow';

export const metadata = { title: 'ניהול פלייבוקים — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

export default async function PlaybooksAdminPage() {
  const items = await listPlaybooks();

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">פלייבוקים</h1>
          <p className="text-sm text-neutral-500 mt-1">
            ידני (עם YouTube, קאבר, סיווג) או אוטומטי מקורסים. רק פלייבוקים &quot;פורסם&quot; מופיעים ב-Hub.
          </p>
        </div>
        <Link
          href="/admin/playbooks/new"
          className="flex items-center gap-2 px-4 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> פלייבוק חדש
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-pill bg-emerald-50 flex items-center justify-center text-emerald-600">
            <BookText className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-neutral-900 mb-1">עוד אין פלייבוקים</h3>
          <p className="text-sm text-neutral-500 mb-4">צור פלייבוק ידני, או חזור לקורס וצור אחד אוטומטית.</p>
          <Link
            href="/admin/playbooks/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> צור פלייבוק חדש
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">כותרת</th>
                <th className="text-right px-4 py-3 font-semibold">מקור</th>
                <th className="text-right px-4 py-3 font-semibold">תחום</th>
                <th className="text-right px-4 py-3 font-semibold">סטטוס</th>
                <th className="text-right px-4 py-3 font-semibold">עודכן</th>
                <th className="text-right px-4 py-3 font-semibold w-32">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <PlaybookRow key={p.id} playbook={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
