import Link from 'next/link';
import { ArrowLeft, Layers, Check } from 'lucide-react';
import type { ContentItem } from '@/lib/learn/types';
import { resolveDisplayPrice } from '@/lib/learn/access';

/**
 * Catalog card for a bundle (type='bundle'). Mirrors CourseCard's look but links
 * to the bundle landing and shows the bundle price + how many courses it packs.
 * `owned` flips the CTA to "ברשותך" when the viewer already bought the bundle.
 */
export default function BundleCard({
  bundle: b,
  courseCount = 0,
  owned = false,
}: {
  bundle: ContentItem;
  courseCount?: number;
  owned?: boolean;
}) {
  const dp = resolveDisplayPrice(b);

  return (
    <Link
      href={`/learn/bundles/${b.slug}`}
      className="group block overflow-hidden rounded-card border border-neutral-200 bg-white transition-all hover:border-brand-purple-700"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="relative aspect-[16/9] bg-brand-purple-900"
        style={
          b.cover_url
            ? { backgroundImage: `url(${b.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { backgroundImage: 'linear-gradient(135deg, #2E1A5C 0%, #4B2E83 60%, #5F3E9C 100%)' }
        }
      >
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-pill bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          <Layers className="w-3.5 h-3.5" />
          חבילה
        </span>
        {owned && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-pill bg-emerald-500/95 px-2 py-1 text-[10px] font-extrabold text-white">
            <Check className="w-3 h-3" />
            ברשותך
          </span>
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          {courseCount > 0 && (
            <span className="inline-flex items-center self-start rounded-pill bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm">
              {courseCount} קורסים בחבילה
            </span>
          )}
          <h3 className="mt-2.5 line-clamp-2 text-lg font-extrabold leading-tight text-white">{b.title}</h3>
        </div>
      </div>

      <div className="p-5">
        {b.tagline && <p className="mb-4 line-clamp-2 min-h-[2.6em] text-sm text-neutral-500">{b.tagline}</p>}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-baseline gap-2">
            {owned ? (
              <span className="text-sm font-bold text-emerald-700">ברשותך</span>
            ) : dp.final ? (
              <>
                <span className="text-base font-extrabold text-neutral-950">{dp.final}</span>
                {dp.hasDiscount && dp.original && (
                  <span className="text-xs text-neutral-400 line-through">{dp.original}</span>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-neutral-500">פרטים</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple-700 transition-colors group-hover:text-brand-purple-500">
            {owned ? 'למעבר' : 'לחבילה'}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
