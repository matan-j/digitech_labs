'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRow } from './page';

const STATUS_LABEL: Record<UserRow['subscription_status'], string> = {
  active: 'מנוי פעיל',
  cancelled: 'בוטל',
  past_due: 'בפיגור',
  none: 'אין מנוי',
};

const STATUS_CLS: Record<UserRow['subscription_status'], string> = {
  active: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-neutral-200 text-neutral-700',
  past_due: 'bg-amber-100 text-amber-800',
  none: 'bg-neutral-100 text-neutral-600',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try { return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short' }).format(new Date(iso)); }
  catch { return iso; }
}

export default function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = users.filter((u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()));

  async function setRole(userId: string, role: 'admin' | 'subscriber') {
    setBusyId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    if (res.ok) startTransition(() => router.refresh());
    else alert('שגיאה');
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי מייל..."
          className="w-full max-w-sm px-3 py-2 rounded-md border border-neutral-300 focus:border-brand-purple-400 focus:outline-none text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="text-right px-4 py-3 font-semibold">מייל</th>
              <th className="text-right px-4 py-3 font-semibold">תפקיד</th>
              <th className="text-right px-4 py-3 font-semibold">מנוי</th>
              <th className="text-right px-4 py-3 font-semibold">חיוב הבא</th>
              <th className="text-right px-4 py-3 font-semibold">נרשם</th>
              <th className="text-right px-4 py-3 font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900" dir="ltr">{u.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-block px-2 py-0.5 rounded-pill text-[11px] font-semibold',
                      u.role === 'admin' ? 'bg-brand-purple-100 text-brand-purple-800' : 'bg-neutral-100 text-neutral-600',
                    ].join(' ')}
                  >
                    {u.role === 'admin' ? 'אדמין' : 'משתמש'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-pill text-[11px] font-semibold ${STATUS_CLS[u.subscription_status]}`}>
                    {STATUS_LABEL[u.subscription_status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{formatDate(u.current_period_end)}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  {u.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => setRole(u.id, 'subscriber')}
                      disabled={busyId === u.id || pending}
                      className="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
                    >
                      הסר אדמין
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRole(u.id, 'admin')}
                      disabled={busyId === u.id || pending}
                      className="text-xs text-brand-purple-700 hover:text-brand-purple-800 font-semibold disabled:opacity-50"
                    >
                      קדם לאדמין
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">לא נמצאו משתמשים.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
