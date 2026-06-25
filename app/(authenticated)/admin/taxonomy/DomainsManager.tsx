'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import {
  DOMAIN_COLOR_OPTIONS,
  domainDotClasses,
  type DomainColor,
  type DomainMeta,
} from '@/lib/learn/domains';

type Props = { initial: DomainMeta[]; usage: Record<string, number> };

export default function DomainsManager({ initial, usage }: Props) {
  const router = useRouter();
  const [domains, setDomains] = useState<DomainMeta[]>(initial);
  const [counts, setCounts] = useState<Record<string, number>>(usage);
  const [busy, setBusy] = useState(false);

  // Add-row state
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState<DomainColor>('slate');

  function sortDomains(list: DomainMeta[]) {
    return [...list].sort((a, b) => {
      const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      return so !== 0 ? so : a.label.localeCompare(b.label, 'he');
    });
  }

  async function addDomain() {
    if (!newLabel.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim(), color: newColor, sort_order: (domains.length + 1) * 10 }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setDomains((prev) => sortDomains([...prev, data.item as DomainMeta]));
        setCounts((prev) => ({ ...prev, [data.item.id]: 0 }));
        setNewLabel('');
        setNewColor('slate');
      } else {
        alert(`שגיאה: ${data.message ?? data.error ?? 'unknown'}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveDomain(id: string, label: string, color: DomainColor) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, color }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setDomains((prev) => prev.map((d) => (d.id === id ? (data.item as DomainMeta) : d)));
      } else {
        alert(`שגיאה: ${data.message ?? data.error ?? 'unknown'}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteDomain(id: string) {
    if (!confirm('למחוק את התחום?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== id));
        router.refresh();
      } else {
        alert(`שגיאה: ${data.message ?? data.error ?? 'unknown'}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 text-neutral-500 text-xs">
            <th className="text-right font-semibold px-4 py-3">צבע</th>
            <th className="text-right font-semibold px-4 py-3">שם התחום</th>
            <th className="text-right font-semibold px-4 py-3">מזהה (slug)</th>
            <th className="text-right font-semibold px-4 py-3">בשימוש</th>
            <th className="text-left font-semibold px-4 py-3">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {domains.map((d) => (
            <DomainRow
              key={d.id}
              domain={d}
              usage={counts[d.id] ?? 0}
              busy={busy}
              onSave={saveDomain}
              onDelete={deleteDomain}
            />
          ))}

          {/* Add row */}
          <tr className="bg-neutral-50/60">
            <td className="px-4 py-3">
              <ColorSelect value={newColor} onChange={setNewColor} disabled={busy} />
            </td>
            <td className="px-4 py-3" colSpan={2}>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addDomain(); }}
                placeholder="שם תחום חדש…"
                disabled={busy}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
              />
            </td>
            <td className="px-4 py-3 text-neutral-300 text-xs">—</td>
            <td className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={addDomain}
                disabled={busy || !newLabel.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> הוסף
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ColorSelect({
  value,
  onChange,
  disabled,
}: {
  value: DomainColor;
  onChange: (c: DomainColor) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={['w-3 h-3 rounded-pill shrink-0', domainDotClasses(value)].join(' ')} aria-hidden />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DomainColor)}
        disabled={disabled}
        className="px-2 py-1 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-xs bg-white"
      >
        {DOMAIN_COLOR_OPTIONS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

function DomainRow({
  domain,
  usage,
  busy,
  onSave,
  onDelete,
}: {
  domain: DomainMeta;
  usage: number;
  busy: boolean;
  onSave: (id: string, label: string, color: DomainColor) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(domain.label);
  const [color, setColor] = useState<DomainColor>(domain.color);

  if (editing) {
    return (
      <tr className="bg-brand-purple-50/40">
        <td className="px-4 py-3">
          <ColorSelect value={color} onChange={setColor} disabled={busy} />
        </td>
        <td className="px-4 py-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
          />
        </td>
        <td className="px-4 py-3 text-neutral-400 font-mono text-xs" dir="ltr">{domain.id}</td>
        <td className="px-4 py-3 text-neutral-500">{usage}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => {
                if (label.trim() && (label !== domain.label || color !== domain.color)) {
                  onSave(domain.id, label.trim(), color);
                }
                setEditing(false);
              }}
              disabled={busy}
              className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50"
              title="שמור"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setLabel(domain.label); setColor(domain.color); setEditing(false); }}
              className="p-1.5 rounded text-neutral-400 hover:bg-neutral-100"
              title="בטל"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group hover:bg-neutral-50">
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2">
          <span className={['w-3 h-3 rounded-pill', domainDotClasses(domain.color)].join(' ')} aria-hidden />
          <span className="text-xs text-neutral-400">{domain.color}</span>
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-neutral-900">{domain.label}</td>
      <td className="px-4 py-3 text-neutral-400 font-mono text-xs" dir="ltr">{domain.id}</td>
      <td className="px-4 py-3 text-neutral-500">{usage}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={busy}
            className="p-1.5 rounded text-neutral-400 hover:text-brand-purple-700 hover:bg-brand-purple-50"
            title="ערוך"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(domain.id)}
            disabled={busy || usage > 0}
            title={usage > 0 ? 'התחום בשימוש — לא ניתן למחוק' : 'מחק'}
            className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
