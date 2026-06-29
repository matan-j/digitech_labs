'use client';

import { useState } from 'react';
import { Loader2, UsersRound } from 'lucide-react';
import {
  NEW_RULE_DEFAULTS,
  type GrantableResource,
  type GrantResourceType,
  type RegistrationRuleDraft,
  type RegistrationRuleWithGrants,
} from '@/lib/learn/registration-rules';

function toDraft(r: RegistrationRuleWithGrants | null): RegistrationRuleDraft {
  if (!r) return { ...NEW_RULE_DEFAULTS, grants: [] };
  return {
    name: r.name,
    enabled: r.enabled,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    grants: r.grants.map((g) => ({ resource_type: g.resource_type, resource_id: g.resource_id })),
  };
}

/** timestamptz <-> <input type="datetime-local"> (local time, no seconds). */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const labelCls = 'block text-sm font-semibold text-neutral-800 mb-1.5';
const inputCls =
  'w-full px-3 py-2.5 rounded-md border border-neutral-300 focus:border-brand-purple-500 focus:outline-none text-sm';
const card = 'bg-white rounded-card border border-brand-purple-200 p-5 sm:p-6';

export default function RegistrationRuleEditor({
  initial,
  resources,
  onSaved,
  onCancel,
}: {
  initial: RegistrationRuleWithGrants | null;
  resources: GrantableResource[];
  onSaved: (r: RegistrationRuleWithGrants) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<RegistrationRuleDraft>(() => toDraft(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  const set = <K extends keyof RegistrationRuleDraft>(k: K, v: RegistrationRuleDraft[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const courses = resources.filter((r) => r.type === 'course');
  const bundles = resources.filter((r) => r.type === 'bundle');

  function isSelected(type: GrantResourceType, id: string) {
    return d.grants.some((g) => g.resource_type === type && g.resource_id === id);
  }
  function toggleResource(type: GrantResourceType, id: string) {
    setD((p) => {
      const exists = p.grants.some((g) => g.resource_type === type && g.resource_id === id);
      const grants = exists
        ? p.grants.filter((g) => !(g.resource_type === type && g.resource_id === id))
        : [...p.grants, { resource_type: type, resource_id: id }];
      return { ...p, grants };
    });
  }

  async function save() {
    setError(null);
    if (!d.name.trim()) {
      setError('יש להזין שם לחוק');
      return;
    }
    if (d.grants.length === 0) {
      setError('יש לבחור לפחות קורס או מוצר אחד');
      return;
    }
    setSaving(true);
    try {
      const url = initial
        ? `/api/admin/registration-rules/${initial.id}`
        : '/api/admin/registration-rules';
      const res = await fetch(url, {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'save failed');
      onSaved(data.item as RegistrationRuleWithGrants);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שמירה נכשלה');
    } finally {
      setSaving(false);
    }
  }

  async function backfill() {
    if (!initial) return;
    if (
      !window.confirm(
        'להעניק את משאבי החוק לכל המשתמשים שכבר נרשמו בטווח התאריכים? פעולה זו לא מבטלת גישה קיימת.',
      )
    )
      return;
    setBackfilling(true);
    setBackfillMsg(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/registration-rules/${initial.id}/backfill`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'backfill failed');
      setBackfillMsg(`הוענקה גישה ל-${data.grantedUsers} משתמשים (${data.totalGrants} הענקות).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ההחלה נכשלה');
    } finally {
      setBackfilling(false);
    }
  }

  function ResourceGroup({ title, type, items }: { title: string; type: GrantResourceType; items: GrantableResource[] }) {
    return (
      <div>
        <p className="text-sm font-semibold text-neutral-800 mb-2">{title}</p>
        {items.length === 0 ? (
          <p className="text-xs text-neutral-400">אין פריטים זמינים.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((it) => {
              const on = isSelected(type, it.id);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => toggleResource(type, it.id)}
                  className={[
                    'px-3.5 py-1.5 rounded-pill text-sm font-medium border transition-colors',
                    on
                      ? 'bg-brand-purple-700 text-white border-brand-purple-700'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-purple-400',
                  ].join(' ')}
                >
                  {it.title}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}
      {backfillMsg && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5">
          {backfillMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* ---------- left column ---------- */}
        <div className="space-y-5">
          <div className={card}>
            <h3 className="font-extrabold text-neutral-950 mb-4">פרטים</h3>
            <div className="mb-4">
              <label className={labelCls}>שם פנימי</label>
              <input
                className={inputCls}
                value={d.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="לדוגמה: מבצע השקה — ספטמבר 2026"
              />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-neutral-700">
              <input type="checkbox" checked={d.enabled} onChange={(e) => set('enabled', e.target.checked)} />
              פעיל (מעניק גישה אוטומטית לנרשמים חדשים בטווח)
            </label>
          </div>

          <div className={card}>
            <h3 className="font-extrabold text-neutral-950 mb-4">טווח הרשמה</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>מתאריך</label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={toLocalInput(d.starts_at)}
                  onChange={(e) => set('starts_at', fromLocalInput(e.target.value))}
                />
              </div>
              <div>
                <label className={labelCls}>עד תאריך</label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={toLocalInput(d.ends_at)}
                  onChange={(e) => set('ends_at', fromLocalInput(e.target.value))}
                />
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              שדה ריק = ללא הגבלה. הזמנים מתפרשים לפי שעון מקומי. הגישה שמוענקת היא קבועה.
            </p>
          </div>
        </div>

        {/* ---------- right column ---------- */}
        <div className="space-y-5">
          <div className={card}>
            <h3 className="font-extrabold text-neutral-950 mb-4">קורסים ומוצרים להענקה</h3>
            <div className="space-y-5">
              <ResourceGroup title="קורסים" type="course" items={courses} />
              <ResourceGroup title="מוצרים (באנדלים)" type="bundle" items={bundles} />
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white font-semibold disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {initial ? 'שמור שינויים' : 'צור חוק'}
        </button>
        {initial && (
          <button
            type="button"
            onClick={backfill}
            disabled={backfilling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill border border-neutral-300 hover:border-brand-purple-400 font-medium disabled:opacity-50"
          >
            {backfilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UsersRound className="w-4 h-4" />}
            החל על נרשמים קיימים
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-pill text-neutral-600 hover:text-neutral-950 font-medium"
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
