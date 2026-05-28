'use client';

import { useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

type Props = {
  courseSlug: string;
  lessonSlug: string;
  lessonId: string;
  initialCompleted: boolean;
};

export default function MarkCompleteButton({ lessonId, initialCompleted }: Props) {
  const [done, setDone] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const next = !done;
    // Optimistic
    setDone(next);
    try {
      if (next) {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lesson_id: lessonId }),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`/api/progress/${lessonId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      }
      // Broadcast to other components on this page (e.g. CourseSidebar)
      window.dispatchEvent(new CustomEvent('digitech:progress', { detail: { lessonId, completed: next } }));
    } catch {
      // Revert
      setDone(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-semibold transition-all',
        done
          ? 'bg-brand-purple-700 text-white hover:bg-brand-purple-600'
          : 'bg-white text-brand-purple-700 border border-brand-purple-200 hover:border-brand-purple-400',
        loading ? 'opacity-60' : '',
      ].join(' ')}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      {done ? 'הושלם' : 'סמן כהושלם'}
    </button>
  );
}
