'use client';

import { useEffect, useRef, useState } from 'react';
import { parseVimeoInput } from '@/lib/learn/vimeo';

export default function VimeoField({
  value,
  onChange,
  onMetaResolved,
}: {
  value: string;
  onChange: (vimeoId: string) => void;
  /** Fired when oEmbed returns metadata. Editor may use durationLabel to auto-fill duration. */
  onMetaResolved?: (meta: { title: string; thumbnail: string; durationLabel: string }) => void;
}) {
  const [input, setInput] = useState(value || '');
  const [thumb, setThumb] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'invalid' | 'ok'>('idle');
  const debouncer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local in sync if parent changes value externally
  useEffect(() => {
    setInput(value || '');
  }, [value]);

  // When input changes, parse + fetch oEmbed (debounced)
  useEffect(() => {
    if (debouncer.current) clearTimeout(debouncer.current);
    const trimmed = input.trim();
    if (!trimmed) {
      setStatus('idle');
      setThumb(null);
      return;
    }
    const parsed = parseVimeoInput(trimmed);
    if (!parsed) {
      setStatus('invalid');
      setThumb(null);
      return;
    }

    // Commit ID upward immediately
    if (parsed.id !== value) onChange(parsed.id);
    setStatus('parsing');

    debouncer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/learn-admin/vimeo-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: trimmed }),
        });
        const data = await res.json();
        if (data.ok) {
          setStatus('ok');
          setThumb(data.thumbnail || null);
          onMetaResolved?.({
            title: data.title || '',
            thumbnail: data.thumbnail || '',
            durationLabel: data.durationLabel || '',
          });
        } else {
          setStatus('ok'); // still a valid ID — oEmbed may fail for private vids
          setThumb(null);
        }
      } catch {
        setStatus('ok');
        setThumb(null);
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
            placeholder="https://vimeo.com/76979871   או   76979871"
            dir="ltr"
            className={`w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              status === 'invalid' ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          <p className={`text-xs mt-1 ${status === 'invalid' ? 'text-red-600' : 'text-gray-500'}`}>
            {status === 'invalid' && 'לא הצלחתי לזהות וידאו Vimeo. הדבק URL מלא או מספר ID.'}
            {status === 'parsing' && 'בודק…'}
            {status === 'ok' && value && (
              <>
                ID זוהה: <code className="font-mono text-gray-700">{value}</code>
              </>
            )}
            {status === 'idle' && 'הדבק URL של Vimeo או רק את המספר.'}
          </p>
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
