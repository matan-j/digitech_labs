'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Trash2, Plus, ExternalLink, FileText } from 'lucide-react';
import VimeoField from './VimeoField';
import MarkdownEditor from './MarkdownEditor';
import FileUpload from './FileUpload';
import GeneratePlaybookButton from './GeneratePlaybookButton';
import type { DbLesson, DbResource } from '@/lib/learn/types';

type Props = {
  lesson: DbLesson;
  onChange: (next: DbLesson) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
};

const KIND_LABEL: Record<string, string> = {
  pdf: 'PDF', xlsx: 'Excel', docx: 'Word', link: 'קישור',
};

export default function DbLessonRow({ lesson, onChange, onDelete, onDragStart, onDragOver, onDrop }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [vimeoId, setVimeoId] = useState(lesson.vimeo_id ?? '');
  const [duration, setDuration] = useState(lesson.duration ?? '');
  const [body, setBody] = useState(lesson.body ?? '');
  const [resources, setResources] = useState<DbResource[]>(lesson.resources ?? []);
  const [saveBadge, setSaveBadge] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const initialMount = useRef(true);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const persist = useCallback(async (patch: Record<string, unknown>) => {
    setSaveBadge('saving');
    const res = await fetch(`/api/lessons/${lesson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) { setSaveBadge('error'); return; }
    const data = await res.json();
    onChange({ ...lesson, ...data.lesson, resources });
    setSaveBadge('saved');
    setTimeout(() => setSaveBadge('idle'), 1500);
  }, [lesson, onChange, resources]);

  useEffect(() => {
    if (initialMount.current) { initialMount.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist({
        title,
        vimeo_id: vimeoId || null,
        duration: duration || null,
        body: body || null,
      });
    }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, vimeoId, duration, body]);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  async function addLinkResource() {
    const url = prompt('הדבק כתובת URL');
    if (!url) return;
    const title = prompt('כותרת הקישור') ?? url;
    const res = await fetch(`/api/lessons/${lesson.id}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, kind: 'link' }),
    });
    if (res.ok) {
      const data = await res.json();
      setResources((prev) => [...prev, data.resource]);
    }
  }

  async function handleFileUploaded(r: { url: string; sizeMB: number; kind?: 'pdf' | 'xlsx' | 'docx' | 'link'; filename: string }) {
    const res = await fetch(`/api/lessons/${lesson.id}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: r.filename || 'קובץ', url: r.url, size_mb: r.sizeMB, kind: r.kind ?? null }),
    });
    if (res.ok) {
      const data = await res.json();
      setResources((prev) => [...prev, data.resource]);
    }
  }

  async function deleteResource(id: string) {
    if (!confirm('למחוק את הקובץ?')) return;
    const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    if (res.ok) setResources((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-white border border-neutral-200 rounded-lg overflow-hidden"
    >
      <div className="flex items-center gap-3 px-3 py-2.5 bg-neutral-50 border-b border-neutral-100">
        <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab flex-shrink-0" />
        <span className="w-7 h-7 rounded-pill bg-brand-purple-100 text-brand-purple-700 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
          {lesson.num}
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת השיעור"
          className="flex-1 bg-transparent border-0 focus:outline-none text-sm font-semibold text-neutral-900 px-2 -mx-2 py-1 rounded focus:bg-white"
        />
        {saveBadge === 'saving' && <span className="text-[10px] text-blue-600">שומר…</span>}
        {saveBadge === 'saved' && <span className="text-[10px] text-emerald-600">✓ נשמר</span>}
        {saveBadge === 'error' && <span className="text-[10px] text-red-600">⚠ שגיאה</span>}
        <GeneratePlaybookButton mode="video" lessonId={lesson.id} lessonTitle={lesson.title} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-1 text-neutral-500 hover:text-neutral-800"
          aria-label={open ? 'סגור' : 'פתח'}
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => { if (confirm('למחוק את השיעור?')) onDelete(); }}
          className="p-1 text-neutral-400 hover:text-red-600"
          aria-label="מחק שיעור"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">סרטון Vimeo</label>
              <VimeoField
                value={vimeoId}
                onChange={(id) => setVimeoId(id)}
                onMetaResolved={(meta) => {
                  if (!duration && meta.durationLabel) setDuration(meta.durationLabel);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">משך השיעור</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="לדוגמה: 12m 30s"
                dir="ltr"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:border-brand-purple-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">תיאור/תוכן השיעור (Markdown)</label>
            <MarkdownEditor value={body} onChange={setBody} rows={8} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-neutral-600">חומרים מצורפים</label>
              <button
                type="button"
                onClick={addLinkResource}
                className="flex items-center gap-1 text-xs text-brand-purple-700 hover:text-brand-purple-800 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                הוסף קישור חיצוני
              </button>
            </div>
            {resources.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {resources.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-neutral-100 bg-neutral-50 text-sm">
                    <FileText className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="flex-1 truncate">{r.title}</span>
                    {r.kind && <span className="text-[10px] font-mono uppercase text-neutral-500 bg-white px-1.5 py-0.5 rounded">{KIND_LABEL[r.kind] ?? r.kind}</span>}
                    {r.size_mb != null && <span className="text-[10px] text-neutral-400">{Number(r.size_mb).toFixed(1)} MB</span>}
                    <a href={r.url} target="_blank" rel="noopener" className="p-1 text-neutral-400 hover:text-brand-purple-700">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteResource(r.id)}
                      className="p-1 text-neutral-400 hover:text-red-600"
                      aria-label="מחק"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <FileUpload
              bucket="resources"
              compact
              label="העלה קובץ (PDF/Excel/Word — עד 50MB)"
              onUploaded={handleFileUploaded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
