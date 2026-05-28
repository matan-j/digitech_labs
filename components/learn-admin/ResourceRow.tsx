'use client';

import type { Resource } from '@/lib/learn/types';

export default function ResourceRow({
  resource,
  onChange,
  onDelete,
}: {
  resource: Resource;
  onChange: (patch: Partial<Resource>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input
        type="text"
        value={resource.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="שם הקובץ"
        className="col-span-12 sm:col-span-4 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={resource.url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="https://…"
        dir="ltr"
        className="col-span-7 sm:col-span-4 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={resource.kind || 'link'}
        onChange={(e) => onChange({ kind: e.target.value as Resource['kind'] })}
        className="col-span-3 sm:col-span-2 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="pdf">PDF</option>
        <option value="xlsx">Excel</option>
        <option value="docx">Word</option>
        <option value="link">קישור</option>
      </select>
      <input
        type="number"
        step="0.01"
        value={resource.sizeMB ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange({ sizeMB: v === '' ? undefined : Number(v) });
        }}
        placeholder="MB"
        dir="ltr"
        className="col-span-1 sm:col-span-1 border border-gray-300 rounded-md px-1.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label="מחק משאב"
        className="col-span-1 text-red-500 hover:text-red-700 text-lg leading-none p-1"
      >
        ×
      </button>
    </div>
  );
}
