'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink, Plus } from 'lucide-react';
import FileUpload from './FileUpload';
import SaveIndicator, { type SaveState } from './SaveIndicator';
import GeneratePlaybookButton from './GeneratePlaybookButton';
import DbLessonRow from './DbLessonRow';
import type { CourseWithLessons, DbLesson } from '@/lib/learn/types';

type Props = { initial: CourseWithLessons };

export default function CourseEditorV1({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [audience, setAudience] = useState(initial.audience ?? '');
  const [coverUrl, setCoverUrl] = useState(initial.cover_url ?? '');
  const [isPremium, setIsPremium] = useState(initial.is_premium);
  const [status, setStatus] = useState(initial.status);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lessons, setLessons] = useState<DbLesson[]>(initial.lessons);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [addingLesson, setAddingLesson] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const dirty = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const persist = useCallback(async (payload: Record<string, unknown>) => {
    setSaveState('saving');
    try {
      const res = await fetch(`/api/content/course/${initial.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setSaveState('error'); return false; }
      setSaveState('saved');
      dirty.current = false;
      return true;
    } catch {
      setSaveState('error');
      return false;
    }
  }, [initial.slug]);

  useEffect(() => {
    if (!dirty.current) { dirty.current = true; return; }
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
      });
    }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, tagline, description, audience, coverUrl, isPremium]);

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
      status: next,
    });
    if (ok) setStatus(next);
  }

  async function handleDelete() {
    if (!confirm('למחוק את הקורס לצמיתות? כל השיעורים יימחקו גם הם.')) return;
    const res = await fetch(`/api/content/course/${initial.slug}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/courses');
  }

  async function addLesson() {
    const trimmed = newLessonTitle.trim();
    if (!trimmed) return;
    setAddingLesson(true);
    const res = await fetch(`/api/courses/${initial.slug}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    });
    const data = await res.json();
    setAddingLesson(false);
    if (!res.ok) {
      alert('שגיאה: ' + (data.error ?? data.message));
      return;
    }
    setLessons((prev) => [...prev, { ...data.lesson, resources: [] }]);
    setNewLessonTitle('');
  }

  async function deleteLesson(id: string) {
    const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
    if (res.ok) setLessons((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLesson(next: DbLesson) {
    setLessons((prev) => prev.map((l) => (l.id === next.id ? next : l)));
  }

  async function handleDrop(toIdx: number) {
    const fromIdx = dragIndex.current;
    dragIndex.current = null;
    if (fromIdx === null || fromIdx === toIdx) return;

    const next = [...lessons];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    // Renumber positions optimistically
    const renumbered = next.map((l, i) => ({ ...l, num: i + 1, position: i }));
    setLessons(renumbered);

    await fetch('/api/lessons/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordered_ids: renumbered.map((l) => l.id) }),
    });
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-start gap-4 justify-between mb-4">
          <div className="flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-extrabold text-neutral-950 bg-transparent border-0 focus:outline-none focus:bg-neutral-50 rounded px-2 -mx-2 py-1"
            />
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="תיאור קצר"
              className="mt-2 w-full text-sm text-neutral-600 bg-transparent border-0 focus:outline-none focus:bg-neutral-50 rounded px-2 -mx-2 py-1"
            />
          </div>
          <div className="flex flex-col items-end gap-2">
            <SaveIndicator state={saveState} />
            <a
              href={`/learn/courses/${initial.slug}`}
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
              status === 'published' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-brand-purple-700 text-white hover:bg-brand-purple-600',
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
            <span className="font-medium text-neutral-700">פרימיום</span>
          </label>

          <GeneratePlaybookButton mode="course" courseId={initial.id} courseSlug={initial.slug} />

          <button
            type="button"
            onClick={handleDelete}
            className="ms-auto flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
            מחק קורס
          </button>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-3">מטא-דאטה</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">תיאור ארוך</label>
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
              className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
            />
            <label className="block text-xs font-semibold text-neutral-600 mb-1 mt-4">תמונת קאבר</label>
            <FileUpload bucket="covers" preview={coverUrl} onUploaded={(r) => setCoverUrl(r.url)} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide mb-4">
          שיעורים <span className="text-neutral-400 font-normal">({lessons.length})</span>
        </h2>

        {lessons.length === 0 ? (
          <p className="text-sm text-neutral-500 py-4 text-center">עדיין אין שיעורים בקורס זה. הוסף את הראשון 👇</p>
        ) : (
          <div className="space-y-2 mb-4">
            {lessons.map((l, idx) => (
              <DbLessonRow
                key={l.id}
                lesson={l}
                onChange={updateLesson}
                onDelete={() => deleteLesson(l.id)}
                onDragStart={() => { dragIndex.current = idx; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
          <input
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLesson(); } }}
            placeholder="כותרת שיעור חדש"
            className="flex-1 px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={addLesson}
            disabled={!newLessonTitle.trim() || addingLesson}
            className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-300 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            {addingLesson ? 'מוסיף...' : 'הוסף שיעור'}
          </button>
        </div>
      </section>
    </div>
  );
}
