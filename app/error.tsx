'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app:error]', error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-purple-50 px-4 text-center">
      <div className="max-w-md">
        <p className="text-6xl mb-3">⚠️</p>
        <h1 className="text-2xl font-extrabold text-neutral-950 mb-2">משהו השתבש</h1>
        <p className="text-neutral-600 mb-6">
          ניסינו לטעון את העמוד וקיבלנו שגיאה. אפשר לנסות שוב או לחזור לדף הבית.
        </p>
        {error.digest && <p className="text-xs text-neutral-400 mb-4 font-mono">{error.digest}</p>}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white font-semibold transition-colors"
          >
            נסה שוב
          </button>
          <Link
            href="/learn"
            className="px-5 py-2.5 rounded-pill border border-neutral-300 hover:border-brand-purple-400 text-neutral-700 font-medium transition-colors"
          >
            דף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}
