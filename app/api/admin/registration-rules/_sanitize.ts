// Shared field sanitisation for the registration-rules admin API (POST + PUT).
import type { GrantResourceType, GrantSelection } from '@/lib/learn/registration-rules';

const GRANT_TYPES: GrantResourceType[] = ['course', 'bundle'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length ? t : null;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function isoOrNull(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Clean column map for the registration_rules row. When `partial` is true (PUT)
 * only keys present in the body are returned; otherwise (POST) every column gets
 * a value with sane defaults. Grants are handled separately by `sanitizeGrants`.
 */
export function sanitizeRule(body: Record<string, unknown>, partial: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);
  const set = (k: string, value: unknown) => {
    if (!partial || has(k)) out[k] = value;
  };

  set('name', str(body.name) ?? '');
  set('enabled', bool(body.enabled));
  set('starts_at', isoOrNull(body.starts_at));
  set('ends_at', isoOrNull(body.ends_at));

  return out;
}

/**
 * Validate + de-duplicate the selected resources. Drops anything that is not a
 * {course|bundle} + uuid pair. Returns null when the body has no `grants` key
 * (so PUT can skip the replace-set), or an array (possibly empty) otherwise.
 */
export function sanitizeGrants(body: Record<string, unknown>): GrantSelection[] | null {
  if (!Object.prototype.hasOwnProperty.call(body, 'grants')) return null;
  const raw = Array.isArray(body.grants) ? body.grants : [];
  const seen = new Set<string>();
  const out: GrantSelection[] = [];
  for (const g of raw) {
    if (!g || typeof g !== 'object') continue;
    const rt = (g as { resource_type?: unknown }).resource_type;
    const rid = (g as { resource_id?: unknown }).resource_id;
    if (!GRANT_TYPES.includes(rt as GrantResourceType)) continue;
    if (typeof rid !== 'string' || !UUID_RE.test(rid)) continue;
    const key = `${rt}:${rid}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ resource_type: rt as GrantResourceType, resource_id: rid });
  }
  return out;
}
