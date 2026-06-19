'use client';

import { useMemo, useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import CreatorCard from './CreatorCard';
import EmptyState from './EmptyState';
import type { Creator } from '@/lib/learn/types';

export type DirectoryCreator = { creator: Creator; guides: number; playlists: number };

export default function CreatorsDirectory({ creators }: { creators: DirectoryCreator[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter(({ creator }) =>
      [creator.name, creator.role_title ?? '', creator.bio ?? ''].join(' ').toLowerCase().includes(q),
    );
  }, [creators, query]);

  if (creators.length === 0) {
    return <EmptyState icon={Users} title="עדיין לא נוספו יוצרים" message="תוכן חדש מתפרסם כל הזמן — בדוק שוב בקרוב." />;
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש יוצר לפי שם, תפקיד או תחום…"
          className="w-full ps-10 pe-10 py-2.5 rounded-input border border-neutral-300 bg-white text-sm focus:outline-none focus:border-brand-purple-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="נקה חיפוש"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="לא נמצאו יוצרים" message="נסה מילות חיפוש אחרות." compact />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(({ creator, guides, playlists }) => (
            <CreatorCard key={creator.id} creator={creator} guides={guides} playlists={playlists} />
          ))}
        </div>
      )}
    </div>
  );
}
