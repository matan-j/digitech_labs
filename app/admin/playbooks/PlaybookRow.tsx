'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink } from 'lucide-react';
import type { Playbook } from '@/lib/learn/types';

const SOURCE_LABEL = {
  course: 'מקורס',
  video: 'מסרטון',
  manual: 'ידני',
} as const;

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PlaybookRow({ playbook }: { playbook: Playbook }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onDelete() {
    if (!confirm(`למחוק את הפלייבוק "${playbook.title}" לצמיתות?`)) return;
    setBusy(true);
    const res = await fetch(`/api/playbooks/${playbook.id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) startTransition(() => router.refresh());
    else alert('שגיאה במחיקה');
  }

  return (
    <tr className="border-t border-neutral-100 hover:bg-neutral-50">
      <td className="px-4 py-3">
        <Link href={`/learn/playbooks/${playbook.id}`} target="_blank" className="font-semibold text-neutral-900 hover:text-brand-purple-700">
          {playbook.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="inline-block px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          {SOURCE_LABEL[playbook.source_type]}
        </span>
      </td>
      <td className="px-4 py-3 text-neutral-500 text-xs">{formatDate(playbook.created_at)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/learn/playbooks/${playbook.id}`}
            target="_blank"
            className="p-1.5 rounded-md text-neutral-500 hover:text-brand-purple-700 hover:bg-brand-purple-50"
            aria-label="פתח"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
            aria-label="מחק"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
