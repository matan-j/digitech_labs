'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlaybookPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [content, setContent] = useState('');
  const [videoLinksRaw, setVideoLinksRaw] = useState('');
  const [state, setState] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [playbookUrl, setPlaybookUrl] = useState('');
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
  }

  async function generate() {
    if (!title.trim() || !content.trim()) return;
    setState('generating');
    setError('');
    try {
      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, targetAudience: audience, ageGroup, content, videoLinksRaw }),
      });
      const data = await res.json();
      if (data.url) {
        setPlaybookUrl(data.url);
        setState('done');
      } else {
        setError(data.error || 'שגיאה');
        setState('error');
      }
    } catch {
      setError('שגיאת רשת');
      setState('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button onClick={() => router.push('/')} className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
        ← חזור
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">פלייבוק חדש</h1>
        <p className="text-gray-500 mt-1">העלה תוכן ← Claude יבנה פלייבוק אינטראקטיבי</p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-800">פרטי הפלייבוק</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם הקורס / הפלייבוק *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="לדוגמה: מבוא לבינה מלאכותית"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קהל יעד</label>
              <input
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="תלמידי כיתה ט׳"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גיל / כיתה</label>
              <input
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value)}
                placeholder="כיתה ט׳ (גיל 14-15)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-800">תוכן הקורס *</h2>
          <p className="text-sm text-gray-500">הדבק סילבוס, תכנית שיעורים, חומרי לימוד — כל טקסט שתרצה לבסס עליו את הפלייבוק</p>

          {/* File upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <p className="text-sm text-gray-500">📎 לחץ להעלאת קובץ (.txt / .md / .csv)</p>
            <input ref={fileRef} type="file" accept=".txt,.md,.csv,.text" className="hidden" onChange={handleFile} />
          </div>

          <div className="text-center text-xs text-gray-400">— או הדבק ישירות —</div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="הדבק כאן את תוכן הקורס: סילבוס, מודולים, פרקים, חומר לימוד..."
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y"
          />
          {content && (
            <p className="text-xs text-gray-400">{content.length.toLocaleString()} תווים</p>
          )}
        </div>

        {/* Vimeo Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">סרטוני Vimeo (אופציונלי)</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">אופציונלי</span>
          </div>
          <p className="text-sm text-gray-500">
            הוסף לינקים לפי מודול — שורה לכל סרטון:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 space-y-1">
            <div>מודול 1: https://vimeo.com/123456789</div>
            <div>מודול 2: https://vimeo.com/987654321</div>
          </div>
          <textarea
            value={videoLinksRaw}
            onChange={e => setVideoLinksRaw(e.target.value)}
            placeholder={`מודול 1: https://vimeo.com/123456789\nמודול 2: https://vimeo.com/987654321`}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y"
            dir="ltr"
          />
        </div>

        {/* Error */}
        {state === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Success */}
        {state === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
            <p className="text-2xl">🎉</p>
            <p className="font-bold text-green-800 text-lg">הפלייבוק מוכן!</p>
            <div className="bg-white border border-green-200 rounded-lg px-4 py-2 font-mono text-sm text-gray-700 break-all">
              localhost:3002{playbookUrl}
            </div>
            <div className="flex gap-3 justify-center">
              <a
                href={playbookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                🌐 פתח פלייבוק ↗
              </a>
              <button
                onClick={() => { setState('idle'); setContent(''); setTitle(''); setVideoLinksRaw(''); }}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                צור פלייבוק נוסף
              </button>
            </div>
          </div>
        )}

        {/* Generate button */}
        {state !== 'done' && (
          <button
            onClick={generate}
            disabled={state === 'generating' || !title.trim() || !content.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {state === 'generating' ? (
              <><span className="animate-spin text-xl">⟳</span> Claude בונה את הפלייבוק...</>
            ) : (
              '📖 צור פלייבוק'
            )}
          </button>
        )}
        {state === 'generating' && (
          <p className="text-center text-sm text-gray-400">זה לוקח כ-30-60 שניות</p>
        )}
      </div>
    </div>
  );
}
