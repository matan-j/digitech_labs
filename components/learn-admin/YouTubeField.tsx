'use client';

import { useEffect, useRef, useState } from 'react';
import { parseYouTubeInput, youtubeUrl } from '@/lib/learn/youtube';

export type YouTubeMeta = {
  id: string;
  title: string;
  thumbnail: string;
};

export default function YouTubeField({
  value,
  onChange,
  onMetaResolved,
  onUseThumbnail,
  thumbnailAlreadyUsed,
}: {
  /** Stored as canonical watch URL (or empty string). */
  value: string;
  onChange: (videoUrl: string) => void;
  onMetaResolved?: (meta: YouTubeMeta) => void;
  /** Optional callback: if provided, an inline button appears to use the YouTube thumbnail as cover. */
  onUseThumbnail?: (thumbnailUrl: string) => void;
  /** When true, hide/disable the "use as cover" button (cover already matches). */
  thumbnailAlreadyUsed?: boolean;
}) {
  const [input, setInput] = useState(value || '');
  const [thumb, setThumb] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'parsing' | 'invalid' | 'ok'>('idle');
  const debouncer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    if (debouncer.current) clearTimeout(debouncer.current);
    const trimmed = input.trim();
    if (!trimmed) {
      setStatus('idle');
      setThumb(null);
      setTitle('');
      return;
    }
    const parsed = parseYouTubeInput(trimmed);
    if (!parsed) {
      setStatus('invalid');
      setThumb(null);
      setTitle('');
      return;
    }

    const canonical = youtubeUrl(parsed);
    if (canonical !== value) onChange(canonical);
    setStatus('parsing');

    debouncer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/learn-admin/youtube-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: trimmed }),
        });
        const data = await res.json();
        if (data.ok) {
          setStatus('ok');
          setThumb(data.thumbnail || null);
          setTitle(data.title || '');
          onMetaResolved?.({
            id: data.id || parsed.id,
            title: data.title || '',
            thumbnail: data.thumbnail || '',
          });
        } else {
          setStatus('ok'); // ID was valid, just no metadata
          setThumb(null);
          setTitle('');
        }
      } catch {
        setStatus('ok');
        setThumb(null);
        setTitle('');
      }
    }, 500);

    return () => {
      if (debouncer.current) clearTimeout(debouncer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return (
    <div className="space-y-2">
      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://youtube.com/watch?v=...   או   xxxxxxxxxxx"
            dir="ltr"
            className={`w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500 ${
              status === 'invalid' ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          <p className={`text-xs mt-1 ${status === 'invalid' ? 'text-red-600' : 'text-gray-500'}`}>
            {status === 'invalid' && 'לא הצלחתי לזהות וידאו YouTube. הדבק URL מלא או רק את ה-ID (11 תווים).'}
            {status === 'parsing' && 'בודק…'}
            {status === 'ok' && title && <span className="text-gray-700">{title}</span>}
            {status === 'ok' && !title && value && 'מוכן.'}
            {status === 'idle' && 'הדבק URL של YouTube או רק את ה-ID.'}
          </p>
          {onUseThumbnail && thumb && status === 'ok' && !thumbnailAlreadyUsed && (
            <button
              type="button"
              onClick={() => onUseThumbnail(thumb)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-purple-700 hover:text-brand-purple-800 underline underline-offset-2"
            >
              השתמש בתמונה הממוזערת של YouTube כקאבר
            </button>
          )}
        </div>

        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt="thumbnail"
            className="w-32 h-20 object-cover rounded-md border border-gray-200 shrink-0"
          />
        )}
      </div>
    </div>
  );
}
