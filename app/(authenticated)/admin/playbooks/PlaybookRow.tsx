'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink, Pencil } from 'lucide-react';
import type { Playbook } from '@/lib/learn/types';
import { DOMAIN_BY_ID, domainBadgeClasses } from '@/lib/learn/domains';

const SOURCE_LABEL = {
  course: 'מקורס',
  video: 'מסרטון',
  manual: 'ידני',
} as const;

function formatDate(iso: string | null) {
  if (!iso) return '—';
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
    const res = await fetch(`/api/admin/playbooks/${playbook.id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) startTransition(() => router.refresh());
    else alert('שגיאה במחיקה');
  }

  const publicPath = playbook.slug ? `/learn/playbooks/${playbook.slug}` : `/learn/playbooks/${playbook.id}`;
  const editPath = `/admin/playbooks/${playbook.id}`;
  const domainMeta = playbook.domain ? DOMAIN_BY_ID[playbook.domain] : null;

  return (
    <tr className="border-t border-neutral-100 hover:bg-neutral-50">
      <td className="px-4 py-3">
        <Link href={editPath} className="font-semibold text-neutral-900 hover:text-brand-purple-700">
          {playbook.title}
        </Link>
        {playbook.tagline && <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-md">{playbook.tagline}</p>}
      </td>
      <td className="px-4 py-3">
        <span className="inline-block px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          {SOURCE_LABEL[playbook.source_type]}
        </span>
      </td>
      <td className="px-4 py-3">
        {domainMeta ? (
          <span className={['inline-block px-2 py-0.5 rounded-pill text-[11px] font-semibold border', domainBadgeClasses(playbook.domain)].join(' ')}>
            {domainMeta.label}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={[
            'inline-block px-2 py-0.5 rounded-pill text-[11px] font-semibold',
            playbook.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700',
          ].join(' ')}
        >
          {playbook.status === 'published' ? 'פורסם' : 'טיוטה'}
        </span>
      </td>
      <td className="px-4 py-3 text-neutral-500 text-xs">{formatDate(playbook.updated_at ?? playbook.created_at)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <Link
            href={editPath}
            className="p-1.5 rounded-md text-neutral-500 hover:text-brand-purple-700 hover:bg-brand-purple-50"
            aria-label="ערוך"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <Link
            href={publicPath}
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
