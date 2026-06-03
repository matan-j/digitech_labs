import { parseVimeoInput } from './vimeo';
import { slugify, uniqueSlug, type ParsedLesson, type RowError, type ParseResult } from './bulkImport';

/**
 * Parse a prose document (.docx / .pdf extracted to plain text) into lessons.
 *
 * Anchor model: each Vimeo URL on its own line is a lesson anchor.
 *   - title = the closest non-empty, non-URL line ABOVE the anchor
 *   - body  = all lines AFTER the anchor, until the title line of the NEXT anchor
 *   - num   = chronological order of anchors in the document
 *
 * Filtered out: blank lines (collapsed), religious headers ("בס״ד"),
 * page numbers (lone digit lines).
 */

const VIMEO_LINE_RE = /https?:\/\/(?:www\.)?(?:vimeo\.com|player\.vimeo\.com)\/[^\s<>"')\]]+/i;
const RELIGIOUS_HEADERS = new Set(['בס״ד', "בס''ד", 'בס"ד', "בס''''ד"]);
const MAX_TITLE_LEN = 100;     // titles longer than this are almost certainly body sentences
const MAX_TITLE_LOOKBACK = 4;  // how many non-blank lines above the URL to scan for a title

function isReligiousHeader(line: string): boolean {
  return RELIGIOUS_HEADERS.has(line.trim());
}

function isPageNumber(line: string): boolean {
  return /^\d{1,3}$/.test(line.trim());
}

function normalizeText(raw: string): string[] {
  // Strip BOM, normalize newlines, split
  const cleaned = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const lines = cleaned.split('\n').map((l) => l.replace(/ /g, ' ').trim());

  // Filter out religious headers + page numbers
  const filtered = lines.filter((l) => !isReligiousHeader(l) && !isPageNumber(l));

  // Collapse consecutive blanks to single blank
  const collapsed: string[] = [];
  let prevBlank = false;
  for (const l of filtered) {
    const blank = l === '';
    if (blank && prevBlank) continue;
    collapsed.push(l);
    prevBlank = blank;
  }

  // Strip leading/trailing blanks
  while (collapsed.length && collapsed[0] === '') collapsed.shift();
  while (collapsed.length && collapsed[collapsed.length - 1] === '') collapsed.pop();

  return collapsed;
}

function findVimeoInLine(line: string): { url: string; matchAtStart: boolean } | null {
  const m = line.match(VIMEO_LINE_RE);
  if (!m) return null;
  return { url: m[0], matchAtStart: m.index === 0 };
}

/**
 * Heuristic: lines that look like body sentences (long, end with sentence-final
 * punctuation, contain trailing ellipsis) are unlikely to be lesson titles.
 */
function looksLikeBody(line: string): boolean {
  if (line.length > MAX_TITLE_LEN) return true;
  // Hebrew/English sentence-final punctuation as the last meaningful char
  if (/[.!?…]"?$/.test(line)) return true;
  if (line.endsWith(':') || line.endsWith('—')) return true;
  return false;
}

/**
 * Title-finder: walk backwards from the anchor line, skip blanks and URL-only
 * lines, prefer a short, non-body-looking line within MAX_TITLE_LOOKBACK
 * non-blank lines. Fall back to the first non-blank line if nothing better
 * found within the lookback window.
 */
function findTitleAbove(lines: string[], anchorIdx: number): { title: string; titleIdx: number } | null {
  let fallback: { title: string; titleIdx: number } | null = null;
  let seenNonBlank = 0;
  for (let i = anchorIdx - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    if (findVimeoInLine(line)) continue;
    seenNonBlank++;
    if (!fallback) fallback = { title: line, titleIdx: i };
    if (!looksLikeBody(line)) return { title: line, titleIdx: i };
    if (seenNonBlank >= MAX_TITLE_LOOKBACK) break;
  }
  return fallback;
}

export type ProseParseDebug = {
  totalLines: number;
  anchors: Array<{ lineIdx: number; url: string; vimeoId: string | null }>;
  firstLines: string[];
};

export function parseProseDocument(
  rawText: string,
  debugOut?: { value?: ProseParseDebug }
): ParseResult {
  const lines = normalizeText(rawText);
  if (lines.length === 0) {
    return { valid: [], errors: [{ rowIndex: 0, message: 'המסמך ריק' }], total: 0 };
  }

  // Find every line whose CONTENT is (essentially) just a Vimeo URL.
  // We only treat a line as an anchor if it's a Vimeo URL on its own —
  // otherwise prose containing inline URLs would confuse the title-above heuristic.
  // Dedup by Vimeo numeric id: if the same URL repeats (PDFs sometimes embed
  // links twice), only the FIRST occurrence becomes an anchor.
  type Anchor = { lineIdx: number; url: string };
  const anchors: Anchor[] = [];
  const seenIds = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hit = findVimeoInLine(line);
    if (!hit) continue;
    if (!hit.matchAtStart) {
      const before = line.slice(0, line.indexOf(hit.url)).trim();
      if (before.length > 4) continue;
    }
    const parsed = parseVimeoInput(hit.url);
    if (parsed) {
      if (seenIds.has(parsed.id)) continue; // dedup
      seenIds.add(parsed.id);
    }
    anchors.push({ lineIdx: i, url: hit.url });
  }

  if (debugOut) {
    debugOut.value = {
      totalLines: lines.length,
      anchors: anchors.map((a) => ({
        lineIdx: a.lineIdx,
        url: a.url,
        vimeoId: parseVimeoInput(a.url)?.id ?? null,
      })),
      firstLines: lines.slice(0, 80),
    };
  }

  if (anchors.length === 0) {
    return {
      valid: [],
      errors: [{ rowIndex: 0, message: 'לא נמצאו קישורי Vimeo במסמך' }],
      total: 0,
    };
  }

  const valid: ParsedLesson[] = [];
  const errors: RowError[] = [];
  const seenSlugs = new Set<string>();

  for (let a = 0; a < anchors.length; a++) {
    const anchor = anchors[a];
    const displayRow = a + 1; // human-readable "lesson #" not file row

    const parsedVimeo = parseVimeoInput(anchor.url);
    if (!parsedVimeo) {
      errors.push({
        rowIndex: displayRow,
        message: `שיעור ${displayRow}: קישור Vimeo לא תקין (${anchor.url})`,
      });
      continue;
    }

    const titleHit = findTitleAbove(lines, anchor.lineIdx);
    if (!titleHit) {
      errors.push({
        rowIndex: displayRow,
        message: `שיעור ${displayRow}: לא נמצאה כותרת מעל הקישור`,
      });
      continue;
    }

    // Body = lines between this anchor (exclusive) and the next title (exclusive)
    const bodyStart = anchor.lineIdx + 1;
    let bodyEnd: number;
    if (a + 1 < anchors.length) {
      // Find next anchor's title index — body ends BEFORE it
      const nextAnchor = anchors[a + 1];
      const nextTitleHit = findTitleAbove(lines, nextAnchor.lineIdx);
      bodyEnd = nextTitleHit ? nextTitleHit.titleIdx : nextAnchor.lineIdx;
    } else {
      bodyEnd = lines.length;
    }

    const bodyLines: string[] = [];
    for (let i = bodyStart; i < bodyEnd; i++) {
      bodyLines.push(lines[i]);
    }
    // Trim leading/trailing blanks within body
    while (bodyLines.length && bodyLines[0] === '') bodyLines.shift();
    while (bodyLines.length && bodyLines[bodyLines.length - 1] === '') bodyLines.pop();
    const body = bodyLines.join('\n').trim() || null;

    const num = a + 1;
    const base = slugify(titleHit.title, num);
    const slug = uniqueSlug(base, seenSlugs); // auto-disambiguate same-title sections

    valid.push({
      rowIndex: displayRow,
      num,
      slug,
      title: titleHit.title,
      vimeoId: parsedVimeo.id,
      duration: null,
      body,
      position: valid.length,
    });
  }

  return { valid, errors, total: valid.length + errors.length };
}
