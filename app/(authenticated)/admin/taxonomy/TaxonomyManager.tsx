'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { DOMAINS, type DomainId, type Category, domainDotClasses } from '@/lib/learn/domains';

type Props = { initial: Category[] };

export default function TaxonomyManager({ initial }: Props) {
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>(initial);
  const [busy, setBusy] = useState(false);

  function refresh() {
    router.refresh();
  }

  async function addCategory(domain: DomainId, name: string) {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), domain }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setCats((prev) => [...prev, data.item].sort((a, b) => {
          if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
          return a.name.localeCompare(b.name);
        }));
      } else {
        alert(`שגיאה: ${data.message ?? data.error ?? 'unknown'}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function renameCategory(id: string, name: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setCats((prev) => prev.map((c) => (c.id === id ? data.item : c)));
      } else {
        alert(`שגיאה: ${data.message ?? data.error ?? 'unknown'}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('למחוק את הקטגוריה? כל הפריטים המקושרים יאבדו את הקישור.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCats((prev) => prev.filter((c) => c.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`שגיאה: ${data.message ?? data.error ?? 'unknown'}`);
      }
    } finally {
      setBusy(false);
      refresh();
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {DOMAINS.map((d) => (
        <DomainCard
          key={d.id}
          domain={d.id}
          label={d.label}
          categories={cats.filter((c) => c.domain === d.id)}
          onAdd={(name) => addCategory(d.id, name)}
          onRename={renameCategory}
          onDelete={deleteCategory}
          busy={busy}
        />
      ))}
    </div>
  );
}

function DomainCard({
  domain,
  label,
  categories,
  onAdd,
  onRename,
  onDelete,
  busy,
}: {
  domain: DomainId;
  label: string;
  categories: Category[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const [newName, setNewName] = useState('');

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5">
      <header className="flex items-center gap-2 mb-3">
        <span className={['w-2 h-2 rounded-pill', domainDotClasses(domain)].join(' ')} aria-hidden />
        <h3 className="font-extrabold text-neutral-950">{label}</h3>
        <span className="text-xs text-neutral-400 ms-auto">{categories.length} קטגוריות</span>
      </header>

      <ul className="space-y-1.5 mb-3">
        {categories.length === 0 ? (
          <li className="text-xs text-neutral-400 italic">אין קטגוריות. הוסף את הראשונה ↓</li>
        ) : (
          categories.map((c) => (
            <CategoryRow key={c.id} category={c} onRename={onRename} onDelete={onDelete} busy={busy} />
          ))
        )}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) {
            onAdd(newName);
            setNewName('');
          }
        }}
        className="flex items-center gap-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="שם קטגוריה חדשה…"
          className="flex-1 px-2.5 py-1.5 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> הוסף
        </button>
      </form>
    </section>
  );
}

function CategoryRow({
  category,
  onRename,
  onDelete,
  busy,
}: {
  category: Category;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(category.name);

  if (editing) {
    return (
      <li className="flex items-center gap-2 p-1 rounded-md bg-neutral-50">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="flex-1 px-2 py-1 rounded border border-neutral-200 text-sm"
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            if (val.trim() && val !== category.name) onRename(category.id, val.trim());
            setEditing(false);
          }}
          disabled={busy}
          className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
          title="שמור"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setVal(category.name);
            setEditing(false);
          }}
          className="p-1 rounded text-neutral-400 hover:bg-neutral-100"
          title="בטל"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 group">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex-1 text-right text-sm text-neutral-700 px-2 py-1 rounded hover:bg-neutral-50"
      >
        {category.name}
        <span className="text-[10px] text-neutral-400 ms-2 font-mono">{category.slug}</span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(category.id)}
        disabled={busy}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-red-600"
        title="מחק"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
