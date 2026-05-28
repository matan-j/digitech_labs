'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookText, Loader2, X } from 'lucide-react';

type Props =
  | { mode: 'course'; courseId: string; courseSlug?: string }
  | { mode: 'video'; lessonId: string; lessonTitle: string };

export default function GeneratePlaybookButton(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'error' | 'needs_transcript'>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function run(transcriptOverride?: string) {
    setStatus('running');
    setError(null);
    try {
      if (props.mode === 'course') {
        const res = await fetch('/api/playbooks/from-course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_id: props.courseId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? data.error ?? 'failed');
        setOpen(false);
        router.push(`/learn/playbooks/${data.id}`);
      } else {
        const res = await fetch('/api/playbooks/from-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: props.lessonId,
            transcript: transcriptOverride ?? undefined,
          }),
        });
        const data = await res.json();
        if (res.status === 422 && data.error === 'transcript_unavailable') {
          setStatus('needs_transcript');
          return;
        }
        if (!res.ok) throw new Error(data.message ?? data.error ?? 'failed');
        setOpen(false);
        router.push(`/learn/playbooks/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error');
      setStatus('error');
    }
  }

  const label = props.mode === 'course' ? '📘 צור Playbook מהקורס' : '🎬 צור Playbook מסרטון';
  const description = props.mode === 'course'
    ? 'ניתוח כל השיעורים + סילבוס לפלייבוק HTML אינטראקטיבי (כ-30 שניות).'
    : 'ניתוח התמלול של הסרטון למדריך מובנה (כ-20 שניות).';

  return (
    <>
      <button
        type="button"
        onClick={() => { setStatus('idle'); setError(null); setOpen(true); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white text-xs font-semibold transition-colors"
      >
        <BookText className="w-3.5 h-3.5" />
        {props.mode === 'course' ? 'צור Playbook' : 'Playbook מסרטון'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-extrabold text-neutral-950">{label}</h3>
              <button
                type="button"
                onClick={() => { if (status !== 'running') setOpen(false); }}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-neutral-600 mb-4">{description}</p>

            {status === 'needs_transcript' && (
              <>
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
                  אין תמלול אוטומטי לסרטון זה. הדבק כאן את התמלול ידנית:
                </p>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={8}
                  placeholder="הדבק כאן את התמלול..."
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm mb-3"
                />
              </>
            )}

            {status === 'error' && error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { if (status !== 'running') setOpen(false); }}
                disabled={status === 'running'}
                className="px-4 py-2 rounded-pill border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-neutral-400 disabled:opacity-50"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => run(status === 'needs_transcript' ? transcript : undefined)}
                disabled={status === 'running' || (status === 'needs_transcript' && transcript.trim().length < 50)}
                className="px-4 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-300 text-white text-sm font-semibold flex items-center gap-2"
              >
                {status === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'running' ? 'מייצר... (30 שניות)' : 'צור עכשיו'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
