'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';

export default function ImportLegacyButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!confirm('לייבא קורסים מהמערכת הישנה (filesystem learn.json)?')) return;
    setLoading(true);
    const res = await fetch('/api/admin/import-pipeline', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert('שגיאה: ' + (data.error ?? data.message ?? 'unknown'));
      return;
    }
    alert(`ייבוא הסתיים — ${data.imported ?? 0} חדשים, ${data.updated ?? 0} עודכנו.`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-pill border border-neutral-300 hover:border-brand-purple-400 text-xs font-semibold text-neutral-700 disabled:opacity-50"
    >
      <Download className="w-3.5 h-3.5" />
      {loading ? 'מייבא...' : 'ייבא ישן'}
    </button>
  );
}
