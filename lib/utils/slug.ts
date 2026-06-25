// Shared slug helpers — the single source of truth for turning any title/name
// into a safe URL slug, and for guaranteeing uniqueness against a table.
//
// `toSlug` TRANSLITERATES Hebrew letter-by-letter (it does NOT strip them like
// the older per-route slugify helpers did) so a Hebrew-only title always yields
// a usable, readable base instead of collapsing to an empty string. The AI
// meaning-translation lives in lib/ai/slug-translate.ts and falls back to this.

// Hebrew → Latin transliteration. Kept in sync with lib/learn/bulkImport.ts.
export const HE_TO_LATIN: Record<string, string> = {
  א: 'a', ב: 'b', ג: 'g', ד: 'd', ה: 'h', ו: 'v', ז: 'z', ח: 'h',
  ט: 't', י: 'y', כ: 'k', ך: 'k', ל: 'l', מ: 'm', ם: 'm', נ: 'n',
  ן: 'n', ס: 's', ע: 'a', פ: 'p', ף: 'p', צ: 'ts', ץ: 'ts', ק: 'k',
  ר: 'r', ש: 's', ת: 't',
};

/**
 * Normalize any string (Hebrew, mixed, or English) into a safe URL slug.
 * Hebrew letters are transliterated; everything else is lowercased and
 * collapsed to hyphen-separated alphanumerics. Returns '' if nothing usable.
 */
export function toSlug(input: string): string {
  if (!input) return '';
  return input
    .split('')
    .map((ch) => HE_TO_LATIN[ch] ?? ch)
    .join('')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[֐-׿]/g, '') // drop any leftover Hebrew marks (niqqud, geresh)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, ''); // a slice may cut mid-hyphen
}

/**
 * Return the first slug in the series base, base-2, base-3, … that is free.
 * `exists` reports whether a candidate is already taken (one DB count per call).
 * Mirrors the de-dup loop the create routes used before this was centralized.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
  max = 50,
): Promise<string> {
  let candidate = base;
  for (let n = 2; n < max; n++) {
    if (!(await exists(candidate))) return candidate;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
