'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm({ returnTo }: { returnTo?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const redirect = new URL('/auth/callback', window.location.origin);
    if (returnTo) redirect.searchParams.set('next', returnTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect.toString() },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const search = returnTo ? `?return=${encodeURIComponent(returnTo)}` : '';
    window.location.href = `/login/check-email${search}`;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold text-neutral-800">
          כתובת מייל
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          dir="ltr"
          className="w-full px-3 py-2.5 rounded-md border border-neutral-300 focus:border-brand-purple-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-200 text-neutral-900 text-base"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full px-4 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-300 text-white font-semibold transition-colors"
      >
        {loading ? 'שולח קישור...' : 'שלח לי קישור התחברות'}
      </button>
      <p className="text-xs text-neutral-500 text-center">
        אין צורך בסיסמה — נשלח אליך קישור התחברות חד-פעמי במייל
      </p>
    </form>
  );
}
