'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const derivedSlug = useMemo(() => slugify(title), [title]);
  const effectiveSlug = slugTouched ? slug : derivedSlug;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const finalSlug = effectiveSlug.trim();
    if (!title.trim()) {
      setError('כותרת חובה');
      return;
    }
    if (!finalSlug) {
      setError('Slug חובה');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/learn-admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), slug: finalSlug, tagline: tagline.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'שגיאה');
        setSubmitting(false);
        return;
      }
      router.push(`/learn-admin/${finalSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאת רשת');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/learn-admin"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← חזרה לרשימת הקורסים
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">קורס חדש</h1>
        <p className="text-gray-500 mt-1 text-sm">
          תוכלו להוסיף שיעורים מיד אחרי שיצרתם את הקורס.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">כותרת הקורס *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='לדוגמה: "קורס סוכני AI"'
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">
            Slug (לכתובת URL) *
          </span>
          <input
            type="text"
            value={effectiveSlug}
            dir="ltr"
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="my-course"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="block text-xs text-gray-500 mt-1">
            אותיות קטנות, ספרות ומקפים בלבד. נוצר אוטומטית מהכותרת.
          </span>
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">תקציר (אופציונלי)</span>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="משפט אחד שמופיע על כרטיס הקורס"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Link
            href="/learn-admin"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ביטול
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {submitting ? 'יוצר…' : 'צור והמשך'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Hebrew-aware slugify: keep [a-z0-9] from latin, replace everything else
 * (including Hebrew, spaces, punctuation) with hyphens. Collapse repeats.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
