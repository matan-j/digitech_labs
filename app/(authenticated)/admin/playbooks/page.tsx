import { listPlaybooks } from '@/lib/learn/db';
import { BookText } from 'lucide-react';
import PlaybookRow from './PlaybookRow';

export const metadata = { title: 'ניהול פלייבוקים — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

export default async function PlaybooksAdminPage() {
  const items = await listPlaybooks();

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-950">פלייבוקים</h1>
        <p className="text-sm text-neutral-500 mt-1">פלייבוקים נוצרים אוטומטית מתוך קורסים ושיעורים בעורך הקורס.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-pill bg-emerald-50 flex items-center justify-center text-emerald-600">
            <BookText className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-neutral-900 mb-1">עוד אין פלייבוקים</h3>
          <p className="text-sm text-neutral-500">צור קורס, ערוך אותו, ולחץ &quot;צור Playbook&quot; כדי להפיק את הראשון.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">כותרת</th>
                <th className="text-right px-4 py-3 font-semibold">מקור</th>
                <th className="text-right px-4 py-3 font-semibold">נוצר</th>
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
