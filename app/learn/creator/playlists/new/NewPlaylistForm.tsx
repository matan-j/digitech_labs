'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlaylistForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? data.error ?? 'create_failed');
      setLoading(false);
      return;
    }
    router.push(`/learn/creator/playlists/${data.item.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-white rounded-2xl border border-neutral-200 p-6">
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1.5">שם הפלייליסט</label>
        <input
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="לדוגמה: Claude Design"
          className="w-full px-3 py-2.5 rounded-md border border-neutral-300 focus:border-brand-purple-500 focus:outline-none text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-4 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-300 text-white font-semibold transition-colors"
      >
        {loading ? 'יוצר...' : 'צור והמשך לעריכה'}
      </button>
    </form>
  );
}
