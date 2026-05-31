'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

type State = 'idle' | 'uploading' | 'success' | 'error' | 'deleting';

export default function BrandLogoUploader({ initialUrl }: { initialUrl: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialUrl);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    setError(null);
    setState('uploading');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/brand/logo', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'upload failed');
      setLogoUrl(data.url + '?v=' + Date.now());
      setState('success');
      router.refresh();
      setTimeout(() => setState('idle'), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
      setState('error');
    }
  }

  async function remove() {
    setError(null);
    setState('deleting');
    try {
      const res = await fetch('/api/admin/brand/logo', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'delete failed');
      setLogoUrl(null);
      setState('idle');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
      setState('error');
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void upload(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  }

  const busy = state === 'uploading' || state === 'deleting';

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={[
          'rounded-card border-2 border-dashed transition-colors p-6 sm:p-8 text-center',
          dragOver
            ? 'border-brand-purple-400 bg-brand-purple-50'
            : 'border-brand-purple-200 bg-brand-purple-50/50',
        ].join(' ')}
      >
        {logoUrl ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Brand logo"
              className="w-24 h-24 rounded-card object-contain bg-white border border-brand-purple-200 p-2"
            />
            <p className="text-xs text-neutral-500">הלוגו הנוכחי</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <div className="w-12 h-12 rounded-pill bg-brand-purple-100 flex items-center justify-center text-brand-purple-700">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-neutral-700 mt-1">גרור קובץ לכאן או בחר ידנית</p>
            <p className="text-xs">PNG / SVG / JPG / WebP · עד 2MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={onPick}
          className="hidden"
        />

        <div className="mt-5 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-brand-purple-300 text-white text-sm font-semibold transition-colors"
          >
            {state === 'uploading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מעלה...
              </>
            ) : state === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                הועלה
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {logoUrl ? 'החלף לוגו' : 'העלה לוגו'}
              </>
            )}
          </button>

          {logoUrl && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-pill border border-brand-purple-200 hover:border-red-300 text-neutral-700 hover:text-red-700 text-sm font-semibold transition-colors"
            >
              {state === 'deleting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              הסר
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-card px-4 py-2.5">
          שגיאה: {error}
        </p>
      )}
    </div>
  );
}
