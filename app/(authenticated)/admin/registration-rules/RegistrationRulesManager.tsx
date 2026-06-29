'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowRight, CalendarRange, Package } from 'lucide-react';
import type {
  GrantableResource,
  RegistrationRuleWithGrants,
} from '@/lib/learn/registration-rules';
import RegistrationRuleEditor from './RegistrationRuleEditor';

function fmtWindow(starts: string | null, ends: string | null): string {
  const d = (iso: string) =>
    new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (!starts && !ends) return 'ללא הגבלת תאריך';
  if (starts && ends) return `${d(starts)} – ${d(ends)}`;
  if (starts) return `מ-${d(starts)}`;
  return `עד ${d(ends!)}`;
}

export default function RegistrationRulesManager({
  initialRules,
  resources,
}: {
  initialRules: RegistrationRuleWithGrants[];
  resources: GrantableResource[];
}) {
  const [rules, setRules] = useState<RegistrationRuleWithGrants[]>(initialRules);
  // null = list view; 'new' = create; Rule = edit
  const [editing, setEditing] = useState<RegistrationRuleWithGrants | 'new' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function onSaved(saved: RegistrationRuleWithGrants) {
    setRules((prev) => {
      const i = prev.findIndex((r) => r.id === saved.id);
      if (i === -1) return [saved, ...prev];
      const next = [...prev];
      next[i] = saved;
      return next;
    });
    setEditing(null);
  }

  async function toggleEnabled(r: RegistrationRuleWithGrants) {
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/admin/registration-rules/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !r.enabled }),
      });
      const data = await res.json();
      if (res.ok) onSaved(data.item as RegistrationRuleWithGrants);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(r: RegistrationRuleWithGrants) {
    if (!window.confirm(`למחוק את החוק "${r.name}"? גישה שכבר הוענקה למשתמשים תישאר.`)) return;
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/admin/registration-rules/${r.id}`, { method: 'DELETE' });
      if (res.ok) setRules((prev) => prev.filter((x) => x.id !== r.id));
    } finally {
      setBusyId(null);
    }
  }

  if (editing) {
    return (
      <div>
        <button
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950 mb-5"
        >
          <ArrowRight className="w-4 h-4" /> חזרה לרשימה
        </button>
        <RegistrationRuleEditor
          initial={editing === 'new' ? null : editing}
          resources={resources}
          onSaved={onSaved}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white font-semibold"
        >
          <Plus className="w-4 h-4" /> חוק חדש
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-card border border-brand-purple-200 p-12 text-center text-neutral-500">
          עדיין אין כללי הרשמה. צור את הראשון.
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs">
              <tr>
                <th className="text-right font-semibold px-4 py-3">שם</th>
                <th className="text-right font-semibold px-4 py-3">טווח הרשמה</th>
                <th className="text-right font-semibold px-4 py-3">משאבים</th>
                <th className="text-right font-semibold px-4 py-3">סטטוס</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-3 font-medium text-neutral-950">{r.name}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarRange className="w-3.5 h-3.5" /> {fmtWindow(r.starts_at, r.ends_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> {r.grants.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleEnabled(r)}
                      disabled={busyId === r.id}
                      className={[
                        'px-2.5 py-1 rounded-pill text-xs font-semibold border transition-colors disabled:opacity-50',
                        r.enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100',
                      ].join(' ')}
                    >
                      {r.enabled ? 'פעיל' : 'כבוי'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(r)}
                        className="p-2 rounded-md text-neutral-500 hover:bg-brand-purple-50 hover:text-brand-purple-700"
                        title="עריכה"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(r)}
                        disabled={busyId === r.id}
                        className="p-2 rounded-md text-neutral-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        title="מחיקה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
