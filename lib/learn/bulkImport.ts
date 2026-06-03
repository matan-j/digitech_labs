import { parseVimeoInput } from './vimeo';

/**
 * Pure parsing + validation for the bulk lesson import feature.
 * No I/O, no framework deps — safe to unit-test.
 *
 * Input shape: array of row objects as produced by `XLSX.utils.sheet_to_json`
 * with `{ defval: '', raw: false }` on the first sheet.
 */

export type RawRow = Record<string, unknown>;

export type ParsedLesson = {
  rowIndex: number;
  num: number;
  slug: string;
  title: string;
  vimeoId: string;
  duration: string | null;
  body: string | null;
  position: number;
};

export type RowError = {
  rowIndex: number;
  title?: string;
  message: string;
};

export type ParseResult = {
  valid: ParsedLesson[];
  errors: RowError[];
  total: number;
};

const HEADER_ALIASES: Record<string, string> = {
  'מספר': 'num',
  'num': 'num',
  '#': 'num',
  'כותרת': 'title',
  'title': 'title',
  'שם': 'title',
  'קישור vimeo': 'vimeo',
  'vimeo': 'vimeo',
  'vimeo_url': 'vimeo',
  'vimeo url': 'vimeo',
  'link': 'vimeo',
  'לינק': 'vimeo',
  'slug': 'slug',
  'משך': 'duration',
  'duration': 'duration',
  'אורך': 'duration',
  'תקציר': 'body',
  'body': 'body',
  'תיאור': 'body',
};

const HE_TO_LATIN: Record<string, string> = {
  א: 'a', ב: 'b', ג: 'g', ד: 'd', ה: 'h', ו: 'v', ז: 'z', ח: 'h',
  ט: 't', י: 'y', כ: 'k', ך: 'k', ל: 'l', מ: 'm', ם: 'm', נ: 'n',
  ן: 'n', ס: 's', ע: 'a', פ: 'p', ף: 'p', צ: 'ts', ץ: 'ts', ק: 'k',
  ר: 'r', ש: 's', ת: 't',
};

function normalizeHeaderKey(raw: string): string {
  return raw.toLowerCase().replace(/[:\s ]+$/g, '').trim();
}

export function normalizeHeaders(rows: RawRow[]): RawRow[] {
  return rows.map((row) => {
    const out: RawRow = {};
    for (const [k, v] of Object.entries(row)) {
      const norm = normalizeHeaderKey(k);
      const canonical = HEADER_ALIASES[norm];
      if (canonical) {
        // First occurrence wins (don't let a later unknown alias clobber a known one)
        if (!(canonical in out) || isEmpty(out[canonical])) {
          out[canonical] = v;
        }
      }
    }
    return out;
  });
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function isRowEmpty(row: RawRow): boolean {
  return Object.values(row).every(isEmpty);
}

/**
 * If `base` is already in `seen`, append -2, -3, ... until unique. Same-title
 * lessons (e.g. multiple "פייסבוק" sections) get auto-disambiguated rather
 * than rejected — admin can see the result in the preview before committing.
 */
export function uniqueSlug(base: string, seen: Set<string>): string {
  if (!seen.has(base)) {
    seen.add(base);
    return base;
  }
  let n = 2;
  while (seen.has(`${base}-${n}`)) n++;
  const out = `${base}-${n}`;
  seen.add(out);
  return out;
}

export function slugify(title: string, fallbackNum: number): string {
  const transliterated = title
    .split('')
    .map((ch) => {
      const lower = ch.toLowerCase();
      if (HE_TO_LATIN[lower]) return HE_TO_LATIN[lower];
      if (HE_TO_LATIN[ch]) return HE_TO_LATIN[ch];
      return lower;
    })
    .join('');

  const cleaned = transliterated
    .replace(/[^a-z0-9\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || `lesson-${fallbackNum}`;
}

function parseIntStrict(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    const n = Math.trunc(v);
    return n > 0 ? n : null;
  }
  const s = asString(v);
  if (!/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  return n > 0 ? n : null;
}

export function validateRows(rows: RawRow[]): ParseResult {
  const valid: ParsedLesson[] = [];
  const errors: RowError[] = [];
  const seenSlugs = new Set<string>();

  rows.forEach((row, idx) => {
    if (isRowEmpty(row)) return; // skip blank rows silently

    const sheetRowIndex = idx + 2; // +1 for header, +1 for 1-indexed display
    const title = asString(row.title);

    if (!title) {
      errors.push({
        rowIndex: sheetRowIndex,
        message: `שורה ${sheetRowIndex}: חסרה כותרת`,
      });
      return;
    }

    const vimeoRaw = asString(row.vimeo);
    const parsedVimeo = parseVimeoInput(vimeoRaw);
    if (!parsedVimeo) {
      errors.push({
        rowIndex: sheetRowIndex,
        title,
        message: `שורה ${sheetRowIndex}: קישור Vimeo לא תקין (${vimeoRaw || 'ריק'})`,
      });
      return;
    }

    const explicitNum = parseIntStrict(row.num);
    const num = explicitNum ?? (idx + 1);

    const slugRaw = asString(row.slug);
    const base = slugRaw ? slugify(slugRaw, num) : slugify(title, num);
    const slug = uniqueSlug(base, seenSlugs); // auto-append -2, -3 if same title repeats

    valid.push({
      rowIndex: sheetRowIndex,
      num,
      slug,
      title,
      vimeoId: parsedVimeo.id, // hash dropped — matches VimeoField behavior
      duration: asString(row.duration) || null,
      body: asString(row.body) || null,
      position: valid.length, // chronological by file order, gaps from invalid rows squeezed out
    });
  });

  return { valid, errors, total: valid.length + errors.length };
}
