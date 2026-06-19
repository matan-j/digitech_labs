'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Eye } from 'lucide-react';
import FileUpload from './FileUpload';
import BlockEditor from './BlockEditor';
import SaveIndicator, { type SaveState } from './SaveIndicator';
import YouTubeField from './YouTubeField';
import VimeoField from './VimeoField';
import CategoriesPicker from './CategoriesPicker';
import { DOMAINS, type DomainId, isDomainId } from '@/lib/learn/domains';
import { GUIDE_CONTENT_KINDS, type GuideBlock, type GuideContentKind, type GuideItem } from '@/lib/learn/types';
import { CONTENT_KIND_LABEL } from '@/lib/learn/placeholder';

type CreatorOption = { id: string; name: string };

type Props = {
  initial: GuideItem;
  /** 'admin' shows creator picker + featured toggle; 'creator' hides them. */
  mode?: 'admin' | 'creator';
  /** Creator options for the admin picker. */
  creators?: CreatorOption[];
  /** Where the delete button returns to. */
  backHref?: string;
};

export default function GuideEditor({ initial, mode = 'admin', creators = [], backHref = '/admin/guides' }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [audience, setAudience] = useState(initial.audience ?? '');
  const [coverUrl, setCoverUrl] = useState(initial.cover_url ?? '');
  const [domain, setDomain] = useState<DomainId | null>(initial.domain ?? null);
  const [categoryIds, setCategoryIds] = useState<string[]>((initial.categories ?? []).map((c) => c.id));
  const [isPremium, setIsPremium] = useState(initial.is_premium);
  const [status, setStatus] = useState(initial.status);
  const [blocks, setBlocks] = useState<GuideBlock[]>(initial.body ?? []);

  // Creator Hub fields
  const [contentKind, setContentKind] = useState<GuideContentKind>(initial.content_kind ?? 'article');
  const [contentUrl, setContentUrl] = useState(initial.content_url ?? '');
  const [duration, setDuration] = useState<string>(initial.duration_minutes ? String(initial.duration_minutes) : '');
  const [seoTitle, setSeoTitle] = useState(initial.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(initial.seo_description ?? '');
  const [ogImageUrl, setOgImageUrl] = useState(initial.og_image_url ?? '');
  const [creatorId, setCreatorId] = useState<string>(initial.creator_id ?? '');
  const [isFeatured, setIsFeatured] = useState(initial.is_featured ?? false);

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dirty = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const buildPayload = useCallback((extra?: Record<string, unknown>) => {
    const isVideo = contentKind === 'youtube' || contentKind === 'vimeo';
    const base: Record<string, unknown> = {
      title,
      tagline: tagline || null,
      description: description || null,
      audience: audience || null,
      cover_url: coverUrl || null,
      domain,
      category_ids: categoryIds,
      is_premium: isPremium,
      body: blocks,
      content_kind: contentKind,
      content_url: contentKind === 'article' ? null : contentUrl || null,
      video_url: isVideo ? contentUrl || null : null,
      duration_minutes: duration ? Number(duration) : null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      og_image_url: ogImageUrl || null,
    };
    if (mode === 'admin') {
      base.creator_id = creatorId || null;
      base.is_featured = isFeatured;
    }
    return { ...base, ...extra };
  }, [title, tagline, description, audience, coverUrl, domain, categoryIds, isPremium, blocks, contentKind, contentUrl, duration, seoTitle, seoDescription, ogImageUrl, creatorId, isFeatured, mode]);

  const persist = useCallback(async (payload: Record<string, unknown>) => {
    setSaveState('saving');
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/content/guide/${initial.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveState('error');
        setErrorMsg(data?.message ?? 'שגיאת שמירה');
        console.error('[guide:save]', data);
        return false;
      }
      setSaveState('saved');
      dirty.current = false;
      return true;
    } catch (err) {
      console.error('[guide:save]', err);
      setSaveState('error');
      setErrorMsg('שגיאת רשת');
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
      persist(buildPayload());
    }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, tagline, description, audience, coverUrl, domain, categoryIds, isPremium, blocks, contentKind, contentUrl, duration, seoTitle, seoDescription, ogImageUrl, creatorId, isFeatured]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  async function togglePublish() {
    const next = status === 'published' ? 'draft' : 'published';
    const ok = await persist(buildPayload({ status: next }));
    if (ok) setStatus(next);
  }

  async function handleDelete() {
    if (!confirm('למחוק את המדריך לצמיתות?')) return;
    const res = await fetch(`/api/content/guide/${initial.slug}`, { method: 'DELETE' });
    if (res.ok) router.push(backHref);
  }

  const previewHref = `/learn/guides/${initial.slug}`;

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
              href={previewHref}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-purple-700"
            >
              <Eye className="w-3.5 h-3.5" />
              {status === 'published' ? 'צפה במדריך (פורסם)' : 'תצוגה מקדימה (טיוטה)'}
            </a>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{errorMsg}</div>
        )}

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

          {mode === 'admin' && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-3.5 h-3.5 accent-brand-purple-700"
              />
              <span className="font-medium text-neutral-700">מומלץ (Featured)</span>
            </label>
          )}

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

      {/* Content type */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">סוג תוכן</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {GUIDE_CONTENT_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setContentKind(k)}
              className={[
                'px-3 py-1.5 rounded-pill text-xs font-semibold border transition-colors',
                contentKind === k
                  ? 'bg-brand-purple-700 text-white border-brand-purple-700'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-purple-400',
              ].join(' ')}
            >
              {CONTENT_KIND_LABEL[k]}
            </button>
          ))}
        </div>

        {contentKind === 'youtube' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">קישור YouTube</label>
            <YouTubeField
              value={contentUrl}
              onChange={setContentUrl}
              onUseThumbnail={(thumb) => setCoverUrl(thumb)}
              thumbnailAlreadyUsed={!!coverUrl && coverUrl.includes('ytimg.com')}
            />
          </div>
        )}
        {contentKind === 'vimeo' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">קישור Vimeo</label>
            <VimeoField
              value={contentUrl}
              onChange={(id) => setContentUrl(`https://vimeo.com/${id}`)}
            />
          </div>
        )}
        {contentKind === 'pdf' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">קובץ PDF</label>
            <FileUpload bucket="resources" accept="application/pdf,.pdf" onUploaded={(r) => setContentUrl(r.url)} label="העלה קובץ PDF" />
            {contentUrl && <p className="mt-1.5 text-[11px] text-neutral-500 break-all" dir="ltr">{contentUrl}</p>}
          </div>
        )}
        {contentKind === 'link' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">קישור חיצוני</label>
            <input
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://example.com/resource"
              dir="ltr"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm font-mono"
            />
          </div>
        )}
        {contentKind === 'article' && (
          <p className="text-xs text-neutral-500">מאמר — הוסף את התוכן בעורך הבלוקים בהמשך.</p>
        )}
      </section>

      {/* Cover + classification */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">קאבר, סיווג ומשך</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">תמונת קאבר</label>
            <FileUpload bucket="covers" preview={coverUrl} onUploaded={(r) => setCoverUrl(r.url)} />
            {coverUrl && (
              <button type="button" onClick={() => setCoverUrl('')} className="mt-1.5 text-[11px] text-neutral-400 hover:text-red-600">
                הסר קאבר
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">תחום</label>
              <select
                value={domain ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') { setDomain(null); setCategoryIds([]); }
                  else if (isDomainId(v)) { setDomain(v); setCategoryIds([]); }
                }}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm bg-white"
              >
                <option value="">— ללא תחום —</option>
                {DOMAINS.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">משך (דקות)</label>
              <input
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="לדוגמה: 8"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">קטגוריות</label>
          <CategoriesPicker domain={domain} value={categoryIds} onChange={setCategoryIds} />
        </div>
        {mode === 'admin' && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">יוצר</label>
            <select
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm bg-white"
            >
              <option value="">— ללא יוצר —</option>
              {creators.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
        )}
      </section>

      {/* Metadata + SEO */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">מטא-דאטה ו-SEO</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">תיאור ארוך</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">קהל יעד</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="לדוגמה: מנהלי שיווק" className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">SEO Title</label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">SEO Description</label>
            <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-600 mb-1">תמונת OG (שיתוף)</label>
            <input value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://…" dir="ltr" className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm font-mono" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">
          {contentKind === 'article' ? 'תוכן המדריך' : 'הערות נוספות (אופציונלי)'}
        </h2>
        <BlockEditor value={blocks} onChange={setBlocks} />
      </section>
    </div>
  );
}
