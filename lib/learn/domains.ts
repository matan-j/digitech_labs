/**
 * Fixed domain taxonomy for guides & playbooks. The DB has a CHECK constraint
 * with the exact same set — keep these in sync.
 *
 * Colors are Tailwind palette names (not CSS values) so cards can compose
 * classes like `bg-${color}-100 text-${color}-700`. The brand purple stays
 * exclusive to Marketing (the primary brand color); other domains use neutral
 * tints that don't compete with the brand identity.
 */

export const DOMAIN_IDS = ['marketing', 'ai', 'sales', 'design', 'business', 'tech'] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export type DomainMeta = {
  id: DomainId;
  label: string;
  /** Tailwind color name used to derive bg/text/border classes. */
  color: 'purple' | 'indigo' | 'emerald' | 'amber' | 'blue' | 'slate';
};

export const DOMAINS: readonly DomainMeta[] = [
  { id: 'marketing', label: 'שיווק',     color: 'purple' },
  { id: 'ai',        label: 'AI',         color: 'indigo' },
  { id: 'sales',     label: 'מכירות',    color: 'emerald' },
  { id: 'design',    label: 'עיצוב',     color: 'amber' },
  { id: 'business',  label: 'עסקים',     color: 'blue' },
  { id: 'tech',      label: 'טכנולוגיה', color: 'slate' },
] as const;

export const DOMAIN_BY_ID: Readonly<Record<DomainId, DomainMeta>> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
) as Record<DomainId, DomainMeta>;

export function isDomainId(value: unknown): value is DomainId {
  return typeof value === 'string' && (DOMAIN_IDS as readonly string[]).includes(value);
}

export function getDomainMeta(id: string | null | undefined): DomainMeta | null {
  if (!id || !isDomainId(id)) return null;
  return DOMAIN_BY_ID[id];
}

/**
 * Tailwind class set for badges/pills per domain. Kept here so cards/lists
 * stay visually consistent.
 */
export function domainBadgeClasses(id: DomainId | null | undefined): string {
  if (!id) return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  const meta = DOMAIN_BY_ID[id];
  switch (meta.color) {
    case 'purple':  return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'indigo':  return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'amber':   return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'blue':    return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'slate':   return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function domainDotClasses(id: DomainId | null | undefined): string {
  if (!id) return 'bg-neutral-400';
  const meta = DOMAIN_BY_ID[id];
  switch (meta.color) {
    case 'purple':  return 'bg-purple-500';
    case 'indigo':  return 'bg-indigo-500';
    case 'emerald': return 'bg-emerald-500';
    case 'amber':   return 'bg-amber-500';
    case 'blue':    return 'bg-blue-500';
    case 'slate':   return 'bg-slate-500';
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
