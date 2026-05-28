'use client';

import { useMemo, useState } from 'react';
import { renderMarkdownLite } from '@/lib/learn/markdown';

export default function MarkdownEditor({
  value,
  onChange,
  rows = 10,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
}) {
  const [showPreview, setShowPreview] = useState(true);
  const html = useMemo(() => renderMarkdownLite(value || ''), [value]);

  const insertTimestamp = () => {
    const next = `${value || ''}<span class="timestamp">0:00</span> `;
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex gap-1">
          <Btn onClick={() => onChange(`${value || ''}\n\n## כותרת\n`)}>## H2</Btn>
          <Btn onClick={() => onChange(`${value || ''}\n\n### כותרת קטנה\n`)}>### H3</Btn>
          <Btn onClick={() => onChange(`${value || ''}\n- פריט\n- פריט\n`)}>• רשימה</Btn>
          <Btn onClick={() => onChange(`${value || ''}\n1. שלב\n2. שלב\n`)}>1. ממוספרת</Btn>
          <Btn onClick={insertTimestamp}>⏱ Timestamp</Btn>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
          />
          תצוגה מקדימה
        </label>
      </div>

      <div className={showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-3' : ''}>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder='כותב כאן בעברית. תומך ב-Markdown: ## כותרת, **מודגש**, רשימות, ו-&lt;span class="timestamp"&gt;2:25&lt;/span&gt;'
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans resize-vertical leading-relaxed"
        />
        {showPreview && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto" style={{ maxHeight: `${rows * 1.8 + 4}rem` }}>
            <div className="prose-learn" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium"
    >
      {children}
    </button>
  );
}
