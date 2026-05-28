'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CourseBrief } from '@/lib/types';
import PipelineProgress from '@/components/PipelineProgress';
import CourseFileViewer from '@/components/CourseFileViewer';

function PlaybookButton({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'open' | 'generating' | 'done' | 'error'>('idle');
  const [url, setUrl] = useState('');
  const [videoLinksRaw, setVideoLinksRaw] = useState('');

  async function generate() {
    setState('generating');
    try {
      const res = await fetch(`/api/playbook?slug=${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoLinksRaw }),
      });
      const data = await res.json();
      if (data.url) { setUrl(data.url); setState('done'); }
      else setState('error');
    } catch { setState('error'); }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-600 text-sm font-medium">✓ הפלייבוק מוכן!</span>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
          🌐 פתח פלייבוק ↗
        </a>
      </div>
    );
  }

  if (state === 'open') {
    return (
      <div className="flex flex-col items-end gap-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-72">
        <div className="w-full">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            סרטוני Vimeo (אופציונלי) — שורה לכל סרטון:
          </label>
          <div className="text-xs font-mono text-gray-400 mb-1">מודול 1: https://vimeo.com/123456</div>
          <textarea
            value={videoLinksRaw}
            onChange={e => setVideoLinksRaw(e.target.value)}
            placeholder={`מודול 1: https://vimeo.com/123456789\nמודול 2: https://vimeo.com/987654321`}
            rows={3}
            dir="ltr"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-2 w-full">
          <button onClick={() => setState('idle')}
            className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">
            ביטול
          </button>
          <button onClick={generate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 rounded-lg transition-colors">
            📖 צור פלייבוק
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setState('open')}
      disabled={state === 'generating'}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
    >
      {state === 'generating' ? (
        <><span className="animate-spin">⟳</span> יוצר פלייבוק...</>
      ) : state === 'error' ? '⚠ נסה שוב' : '📖 צור פלייבוק'}
    </button>
  );
}

function CoursePageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const shouldRun = searchParams.get('run') === '1';

  const [brief, setBrief] = useState<CourseBrief | null>(null);
  const [mode, setMode] = useState<'loading' | 'pipeline' | 'viewer'>('loading');

  useEffect(() => {
    // Consume one-shot sessionStorage handoff after hydration. Reading must happen
    // post-mount (sessionStorage is client-only), so the loading → resolved transition
    // legitimately requires a setState in effect here.
    let nextBrief: CourseBrief | null = null;
    let nextMode: 'pipeline' | 'viewer' = 'viewer';
    if (shouldRun) {
      const stored = sessionStorage.getItem('pendingBrief');
      if (stored) {
        sessionStorage.removeItem('pendingBrief');
        nextBrief = JSON.parse(stored) as CourseBrief;
        nextMode = 'pipeline';
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrief(nextBrief);
    setMode(nextMode);
  }, [shouldRun]);

  if (mode === 'loading') {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <span className="animate-spin text-3xl me-3">⟳</span>
        <span>טוען...</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        ← חזור לדשבורד
      </button>

      {mode === 'pipeline' && brief ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">מריץ Pipeline</h1>
            <p className="text-gray-500 mt-1">ה-AI בונה את הקורס שלך — זה ייקח כמה דקות</p>
          </div>
          <PipelineProgress brief={brief} />
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{slug}</h1>
              <p className="text-gray-500 mt-1 text-sm font-mono">{slug}</p>
            </div>
            <PlaybookButton slug={slug} />
          </div>
          <CourseFileViewer slug={slug} />
        </div>
      )}
    </div>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24 text-gray-400">
        <span className="animate-spin text-3xl me-3">⟳</span>
        <span>טוען...</span>
      </div>
    }>
      <CoursePageInner />
    </Suspense>
  );
}
