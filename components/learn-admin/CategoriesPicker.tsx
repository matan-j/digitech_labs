'use client';

import { useEffect, useState } from 'react';
import { DOMAINS, type DomainId, type Category, domainDotClasses, domainBadgeClasses } from '@/lib/learn/domains';

type Props = {
  domain: DomainId | null;
  value: string[];
  onChange: (ids: string[]) => void;
};

export default function CategoriesPicker({ domain, value, onChange }: Props) {
  const [all, setAll] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (!alive) return;
        if (Array.isArray(data.items)) setAll(data.items as Category[]);
        else setErr(data.error ?? 'load_failed');
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : 'load_failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!domain) {
    return (
      <p className="text-xs text-neutral-500 italic">בחר תחום קודם כדי לבחור קטגוריות.</p>
    );
  }

  if (loading) return <p className="text-xs text-neutral-500">טוען קטגוריות…</p>;
  if (err) return <p className="text-xs text-red-600">שגיאה בטעינה: {err}</p>;
  if (!all) return null;

  const domainCats = all.filter((c) => c.domain === domain);
  const meta = DOMAINS.find((d) => d.id === domain);

  if (domainCats.length === 0) {
    return (
      <p className="text-xs text-neutral-500 italic">
        אין קטגוריות עדיין בתחום {meta?.label ?? domain}. הוסף ב-
        <a href="/admin/taxonomy" target="_blank" rel="noopener" className="text-brand-purple-700 hover:underline">
          /admin/taxonomy
        </a>
        .
      </p>
    );
  }

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {domainCats.map((c) => {
        const active = value.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            className={[
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-medium border transition-colors',
              active
                ? domainBadgeClasses(domain)
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
            ].join(' ')}
          >
            <span className={['w-1.5 h-1.5 rounded-pill', domainDotClasses(domain)].join(' ')} aria-hidden />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
