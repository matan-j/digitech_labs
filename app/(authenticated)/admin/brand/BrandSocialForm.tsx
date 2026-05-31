'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { SocialKey } from '@/lib/brand';
import {
  InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon,
  TiktokIcon, XIcon, WebsiteIcon,
} from '@/components/icons/social';

type State = 'idle' | 'saving' | 'success' | 'error';

const FIELDS: { key: SocialKey; label: string; placeholder: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'instagram', label: 'Instagram',   placeholder: 'https://instagram.com/digitech',  Icon: InstagramIcon },
  { key: 'facebook',  label: 'Facebook',    placeholder: 'https://facebook.com/digitech',   Icon: FacebookIcon },
  { key: 'linkedin',  label: 'LinkedIn',    placeholder: 'https://linkedin.com/in/...',     Icon: LinkedinIcon },
  { key: 'youtube',   label: 'YouTube',     placeholder: 'https://youtube.com/@digitech',   Icon: YoutubeIcon },
  { key: 'tiktok',    label: 'TikTok',      placeholder: 'https://tiktok.com/@digitech',    Icon: TiktokIcon },
  { key: 'x',         label: 'X (Twitter)', placeholder: 'https://x.com/digitech',          Icon: XIcon },
  { key: 'website',   label: 'אתר חיצוני',   placeholder: 'https://digi-tech.co.il',         Icon: WebsiteIcon },
];

export default function BrandSocialForm({ initial }: { initial: Record<SocialKey, string | null> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<SocialKey, string>>(() => ({
    instagram: initial.instagram ?? '',
    facebook:  initial.facebook  ?? '',
    linkedin:  initial.linkedin  ?? '',
    youtube:   initial.youtube   ?? '',
    tiktok:    initial.tiktok    ?? '',
    x:         initial.x         ?? '',
    website:   initial.website   ?? '',
  }));
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setState('saving');
    try {
      const res = await fetch('/api/admin/brand/social', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'save failed');
      setState('success');
      router.refresh();
      setTimeout(() => setState('idle'), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
      setState('error');
    }
  }

  return (
    <div className="space-y-3">
      {FIELDS.map(({ key, label, placeholder, Icon }) => (
        <div key={key} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-pill bg-brand-purple-100 text-brand-purple-700 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">{label}</label>
            <input
              type="url"
              dir="ltr"
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-pill border border-brand-purple-200 focus:border-brand-purple-400 focus:outline-none text-sm bg-white"
            />
          </div>
        </div>
      ))}

      <div className="pt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={state === 'saving'}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-brand-purple-300 text-white text-sm font-semibold transition-colors"
        >
          {state === 'saving' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              שומר...
            </>
          ) : state === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              נשמר
            </>
          ) : (
            'שמור קישורים'
          )}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
