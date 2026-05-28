'use client';

import { useState } from 'react';
import type { Lesson, Resource } from '@/lib/learn/types';
import VimeoField from './VimeoField';
import MarkdownEditor from './MarkdownEditor';
import ResourceRow from './ResourceRow';

export default function LessonRow({
  lesson,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  onChange: (patch: Partial<Lesson>) => void;
  onDelete: () => void;
  onMove: (from: number, to: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState<'top' | 'bottom' | null>(null);

  const dragHandlers = {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;
      setDragOver(isTop ? 'top' : 'bottom');
    },
    onDragLeave: () => setDragOver(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(null);
      const from = Number(e.dataTransfer.getData('text/plain'));
      if (isNaN(from)) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;
      let to = isTop ? index : index + 1;
      if (from < to) to -= 1;
      if (from !== to) onMove(from, to);
    },
  };

  const addResource = () => {
    const nextResources: Resource[] = [
      ...(lesson.resources || []),
      { id: randomId(), title: '', url: '', kind: 'link' },
    ];
    onChange({ resources: nextResources });
  };

  const updateResource = (rIdx: number, patch: Partial<Resource>) => {
    const nextResources = (lesson.resources || []).map((r, i) => (i === rIdx ? { ...r, ...patch } : r));
    onChange({ resources: nextResources });
  };

  const deleteResource = (rIdx: number) => {
    const nextResources = (lesson.resources || []).filter((_, i) => i !== rIdx);
    onChange({ resources: nextResources });
  };

  return (
    <div
      {...dragHandlers}
      className={[
        'bg-white rounded-xl border transition-colors',
        dragOver === 'top' ? 'border-t-blue-500 border-t-2' : '',
        dragOver === 'bottom' ? 'border-b-blue-500 border-b-2' : '',
        !dragOver ? 'border-gray-200' : '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <span
          className="cursor-grab text-gray-300 hover:text-gray-500 px-1 select-none"
          title="גרור לסידור מחדש"
        >
          ⋮⋮
        </span>
        <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center shrink-0 tabular-nums">
          {index + 1}
        </span>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="כותרת השיעור"
          className="flex-1 min-w-0 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1.5 font-semibold text-gray-900 bg-transparent"
        />
        <span className="text-xs text-gray-400 hidden sm:inline tabular-nums">{lesson.duration || '—'}</span>
        <button
          type="button"
          onClick={onDelete}
          aria-label="מחק שיעור"
          className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
        >
          מחק
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-md"
        >
          {open ? 'סגור ▴' : 'ערוך ▾'}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                סרטון Vimeo *
              </label>
              <VimeoField
                value={lesson.vimeoId}
                onChange={(id) => onChange({ vimeoId: id })}
                onMetaResolved={(meta) => {
                  // auto-fill duration only if currently empty
                  if (meta.durationLabel && !lesson.duration) {
                    onChange({ duration: meta.durationLabel });
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">משך</label>
              <input
                type="text"
                value={lesson.duration}
                onChange={(e) => onChange({ duration: e.target.value })}
                placeholder='לדוגמה: "1h 12m"'
                dir="ltr"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">ימולא אוטומטית מ-Vimeo אם ריק.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">תוכן השיעור</label>
            <MarkdownEditor
              value={lesson.body}
              onChange={(body) => onChange({ body })}
              rows={12}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-700">
                משאבים להורדה ({(lesson.resources || []).length})
              </label>
              <button
                type="button"
                onClick={addResource}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                + הוסף משאב
              </button>
            </div>
            <div className="space-y-2">
              {(lesson.resources || []).map((r, rIdx) => (
                <ResourceRow
                  key={r.id || rIdx}
                  resource={r}
                  onChange={(patch) => updateResource(rIdx, patch)}
                  onDelete={() => deleteResource(rIdx)}
                />
              ))}
              {(lesson.resources || []).length === 0 && (
                <p className="text-xs text-gray-400 py-2">אין משאבים. לחץ + הוסף משאב כדי להוסיף.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Slug: <code className="font-mono">{lesson.slug}</code>
              {' · '}שיעור {index + 1} מתוך {total}
            </div>
            <a
              href={`/learn/courses/${encodeURIComponent('')}`}
              className="hidden"
              aria-hidden
            />
          </div>
        </div>
      )}
    </div>
  );
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}
