'use client';

import { useState } from 'react';

export default function UpgradeButton({ returnTo }: { returnTo?: string }) {
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnTo }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert(data.error ?? 'שגיאה ביצירת תשלום');
    }
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="w-full px-4 py-3 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-300 text-white font-semibold transition-colors"
    >
      {loading ? 'מעביר לתשלום מאובטח...' : 'הירשם למועדון'}
    </button>
  );
}
