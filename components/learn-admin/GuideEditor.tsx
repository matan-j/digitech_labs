'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink } from 'lucide-react';
import FileUpload from './FileUpload';
import BlockEditor from './BlockEditor';
import SaveIndicator, { type SaveState } from './SaveIndicator';
import type { GuideBlock, GuideItem } from '@/lib/learn/types';

type Props = { initial: GuideItem };

export default function GuideEditor({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [audience, setAudience] = useState(initial.audience ?? '');
  const [coverUrl, setCoverUrl] = useState(initial.cover_url ?? '');
  const [isPremium, setIsPremium] = useState(initial.is_premium);
  const [status, setStatus] = useState(initial.status);
  const [blocks, setBlocks] = useState<GuideBlock[]>(initial.body ?? []);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const dirty = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const persist = useCallback(async (payload: Record<string, unknown>) => {
    setSaveState('saving');
    try {
      const res = await fetch(`/api/content/guide/${initial.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveState('error');
        console.error('[guide:save]', data);
        return false;
      }
      void data;
      setSaveState('saved');
      dirty.current = false;
      return true;
    } catch (err) {
      console.error('[guide:save]', err);
      setSaveState('error');
      return false;
    }
  }, [initial.slug]);

  // Debounced autosave
  useEffect(() => {
    if (!dirty.current) {
      dirty.current = true;
      return; // skip initial mount
    }
    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist({
        title,
        tagline: tagline || null,
        description: description || null,
        audience: audience || null,
        cover_url: coverUrl || null,
        is_premium: isPremium,
        body: blocks,
      });
    }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, tagline, description, audience, coverUrl, isPremium, blocks]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  async function togglePublish() {
    const next = status === 'published' ? 'draft' : 'published';
    const ok = await persist({
      title,
      tagline: tagline || null,
      description: description || null,
      audience: audience || null,
      cover_url: coverUrl || null,
      is_premium: isPremium,
      body: blocks,
      status: next,
    });
    if (ok) setStatus(next);
  }

  async function handleDelete() {
    if (!confirm('למחוק את המדריך לצמיתות?')) return;
    const res = await fetch(`/api/content/guide/${initial.slug}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/guides');
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-start gap-4 justify-between mb-4">
          <div className="flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת המדריך"
              className="w-full text-2xl font-extrabold text-neutral-950 bg-transparent border-0 focus:outline-none focus:bg-neutral-50 rounded px-2 -mx-2 py-1"
            />
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="תיאור קצר (tagline)"
              className="mt-2 w-full text-sm text-neutral-600 bg-transparent border-0 focus:outline-none focus:bg-neutral-50 rounded px-2 -mx-2 py-1"
            />
          </div>
          <div className="flex flex-col items-end gap-2">
            <SaveIndicator state={saveState} />
            <a
              href={`/learn/guides/${initial.slug}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-purple-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              צפה כלומד
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={togglePublish}
            className={[
              'px-4 py-1.5 rounded-pill text-xs font-semibold transition-colors',
              status === 'published'
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-brand-purple-700 text-white hover:bg-brand-purple-600',
            ].join(' ')}
          >
            {status === 'published' ? '✓ פורסם — לחץ לביטול' : 'פרסם'}
          </button>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-3.5 h-3.5 accent-brand-purple-700"
            />
            <span className="font-medium text-neutral-700">תוכן פרימיום (דורש מנוי)</span>
          </label>

          <button
            type="button"
            onClick={handleDelete}
            className="ms-auto flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
            מחק
          </button>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">מטא-דאטה</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">תיאור ארוך (description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">קהל יעד</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="לדוגמה: מנהלי שיווק, יזמים מתחילים"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
            />
            <label className="block text-xs font-semibold text-neutral-600 mb-1 mt-4">תמונת קאבר</label>
            <FileUpload
              bucket="covers"
              preview={coverUrl}
              onUploaded={(r) => setCoverUrl(r.url)}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">תוכן המדריך</h2>
        <BlockEditor value={blocks} onChange={setBlocks} />
      </section>
    </div>
  );
}
