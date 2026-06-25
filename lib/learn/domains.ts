/**
 * Domain taxonomy for courses, guides & playbooks.
 *
 * Domains are now admin-managed (migration 039 — `domains` table). The list
 * below is the SEED / FALLBACK: it mirrors the seeded rows and is used when the
 * DB is unreachable or the table doesn't exist yet, so the app degrades to the
 * original 6 instead of breaking. Server code should prefer `listDomains()`
 * (lib/learn/db.ts); client code fetches `/api/domains`.
 *
 * Colors are Tailwind palette names (not CSS values). The class maps below list
 * every allowed color as a STATIC string so Tailwind never purges them — this
 * is why new domains must pick a color from `DOMAIN_COLOR_OPTIONS`.
 */

/** A domain id is a lowercase slug. Was a fixed union; now any admin-defined slug. */
export type DomainId = string;

/** Allowed badge colors — must stay in sync with the CHECK in migration 039. */
export type DomainColor =
  | 'purple' | 'indigo' | 'emerald' | 'amber' | 'blue' | 'slate'
  | 'rose' | 'teal' | 'cyan' | 'orange' | 'fuchsia' | 'lime' | 'sky' | 'pink';

export const DOMAIN_COLOR_OPTIONS: readonly DomainColor[] = [
  'purple', 'indigo', 'emerald', 'amber', 'blue', 'slate',
  'rose', 'teal', 'cyan', 'orange', 'fuchsia', 'lime', 'sky', 'pink',
] as const;

export type DomainMeta = {
  id: DomainId;
  label: string;
  /** Tailwind color name used to derive bg/text/border classes. */
  color: DomainColor;
  /** Ordering for filter rows / admin table. */
  sort_order?: number;
};

/** Seeded ids — kept for legacy callers that expect the original set. */
export const DOMAIN_IDS = ['marketing', 'ai', 'sales', 'design', 'business', 'tech'] as const;

/** Fallback domain list (matches the migration 039 seed). */
export const DOMAINS: readonly DomainMeta[] = [
  { id: 'marketing', label: 'שיווק',     color: 'purple',  sort_order: 10 },
  { id: 'ai',        label: 'AI',         color: 'indigo',  sort_order: 20 },
  { id: 'sales',     label: 'מכירות',    color: 'emerald', sort_order: 30 },
  { id: 'design',    label: 'עיצוב',     color: 'amber',   sort_order: 40 },
  { id: 'business',  label: 'עסקים',     color: 'blue',    sort_order: 50 },
  { id: 'tech',      label: 'טכנולוגיה', color: 'slate',   sort_order: 60 },
] as const;

export const DOMAIN_BY_ID: Readonly<Record<string, DomainMeta>> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
) as Record<string, DomainMeta>;

export function isDomainId(value: unknown): value is DomainId {
  return typeof value === 'string' && value.length > 0;
}

/** Resolve a domain id to its seeded meta (fallback only — the 6 built-ins). */
export function getDomainMeta(id: string | null | undefined): DomainMeta | null {
  if (!id) return null;
  return DOMAIN_BY_ID[id] ?? null;
}

/** Build a quick id→meta lookup from a (possibly dynamic) domain list. */
export function domainMapOf(domains: readonly DomainMeta[]): Map<string, DomainMeta> {
  return new Map(domains.map((d) => [d.id, d]));
}

/**
 * Tailwind class set for badges/pills per COLOR. Every branch is a static
 * literal so Tailwind keeps the classes. Pass a `DomainColor` (e.g. meta.color).
 */
export function domainBadgeClasses(color: DomainColor | null | undefined): string {
  switch (color) {
    case 'purple':  return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'indigo':  return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'amber':   return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'blue':    return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'slate':   return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'rose':    return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'teal':    return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'cyan':    return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'orange':  return 'bg-orange-100 text-orange-900 border-orange-200';
    case 'fuchsia': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
    case 'lime':    return 'bg-lime-100 text-lime-900 border-lime-200';
    case 'sky':     return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'pink':    return 'bg-pink-100 text-pink-800 border-pink-200';
    default:        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
}

export function domainDotClasses(color: DomainColor | null | undefined): string {
  switch (color) {
    case 'purple':  return 'bg-purple-500';
    case 'indigo':  return 'bg-indigo-500';
    case 'emerald': return 'bg-emerald-500';
    case 'amber':   return 'bg-amber-500';
    case 'blue':    return 'bg-blue-500';
    case 'slate':   return 'bg-slate-500';
    case 'rose':    return 'bg-rose-500';
    case 'teal':    return 'bg-teal-500';
    case 'cyan':    return 'bg-cyan-500';
    case 'orange':  return 'bg-orange-500';
    case 'fuchsia': return 'bg-fuchsia-500';
    case 'lime':    return 'bg-lime-500';
    case 'sky':     return 'bg-sky-500';
    case 'pink':    return 'bg-pink-500';
    default:        return 'bg-neutral-400';
  }
}

export type Category = {
  id: string;
  slug: string;
  name: string;
  domain: DomainId;
  description: string | null;
  sort_order: number;
};
