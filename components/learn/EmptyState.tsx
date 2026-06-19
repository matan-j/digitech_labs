import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

/**
 * Branded empty state — a white rounded card with a purple icon circle.
 * Used across the hub so we never show a blank screen.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  cta,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  message?: string;
  cta?: { label: string; href: string };
  compact?: boolean;
}) {
  return (
    <div
      className={[
        'bg-white rounded-card border border-neutral-200 text-center',
        compact ? 'p-8' : 'p-12',
      ].join(' ')}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-pill bg-brand-purple-50 flex items-center justify-center text-brand-purple-600">
        <Icon className="w-7 h-7" strokeWidth={1.6} />
      </div>
      <h3 className="font-extrabold text-neutral-900 mb-1.5">{title}</h3>
      {message && <p className="text-sm text-neutral-500 max-w-sm mx-auto">{message}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white text-sm font-semibold transition-colors"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
