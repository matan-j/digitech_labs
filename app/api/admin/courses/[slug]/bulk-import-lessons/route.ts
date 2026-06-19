import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import {
  normalizeHeaders,
  validateRows,
  type ParsedLesson,
  type RawRow,
  type ParseResult,
} from '@/lib/learn/bulkImport';
import { parseProseDocument, type ProseParseDebug } from '@/lib/learn/bulkImportProse';

/**
 * Bulk lesson import — single endpoint, two modes.
 *
 *   POST ?mode=preview  → parse + validate, return per-row results (no writes)
 *   POST ?mode=commit   → parse + validate + upsert lessons by (course_id, slug)
 *
 * Upsert is by slug (matches DB UNIQUE constraint), which preserves lesson IDs
 * across re-uploads so any `progress.lesson_id` rows survive. Trade-off:
 * admins must not rename slugs in the sheet between uploads.
 *
 * Lessons in the DB that aren't in the sheet are left untouched (additive).
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;

const ACCEPTED_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'text/csv',
  'application/csv',
  'text/plain', // some browsers send CSVs as text/plain
  'application/octet-stream',
]);

type Format = 'xlsx' | 'csv' | 'docx' | 'pdf';

function detectFormat(name: string): Format | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.pdf')) return 'pdf';
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') === 'commit' ? 'commit' : 'preview';
  const wantsDebug = url.searchParams.get('debug') === '1';

  const admin = createServiceClient();

  const { data: course, error: courseErr } = await admin
    .from('content_items')
    .select('id, title')
    .eq('type', 'course')
    .eq('slug', slug)
    .maybeSingle();

  if (courseErr) {
    return NextResponse.json({ error: 'db_error', message: courseErr.message }, { status: 500 });
  }
  if (!course) {
    return NextResponse.json({ error: 'course_not_found' }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'missing_file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'file_too_large', message: 'הקובץ גדול מ-5MB (עד ~500 שיעורים)' },
      { status: 413 }
    );
  }

  const format = detectFormat(file.name);
  if (!format && !ACCEPTED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        error: 'unsupported_format',
        message: 'פורמט לא נתמך — נדרש .xlsx, .csv, .docx או .pdf',
      },
      { status: 415 }
    );
  }

  let parsed: ParseResult;
  let rawExtractedText: string | null = null;
  const debugBag: { value?: ProseParseDebug } = {};
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    if (format === 'docx') {
      const mammoth = (await import('mammoth')).default;
      // convertToHtml preserves <a href> hyperlinks (extractRawText drops them).
      const html = (await mammoth.convertToHtml({ buffer: buf })).value;
      const text = htmlToTextWithLinks(html);
      if (wantsDebug) rawExtractedText = text;
      parsed = parseProseDocument(text, debugBag);
    } else if (format === 'pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buf);
      if (wantsDebug) rawExtractedText = result.text;
      parsed = parseProseDocument(result.text, debugBag);
    } else {
      // xlsx or csv (default if format unknown but mime is accepted)
      const wb = XLSX.read(buf, { type: 'buffer', codepage: 65001 });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) {
        return NextResponse.json(
          { error: 'empty_workbook', message: 'הקובץ ריק או פגום' },
          { status: 400 }
        );
      }
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '', raw: false });
      parsed = validateRows(normalizeHeaders(rows));
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: 'parse_failed',
        message: `כשל בקריאת הקובץ: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 400 }
    );
  }

  // Determine which valid rows are inserts vs updates, and capture the existing
  // module_id per slug so updates don't accidentally move a lesson out of its
  // current module (which would violate the (module_id, slug) UNIQUE constraint
  // if another lesson with the same slug already lives in the default module).
  const validSlugs = parsed.valid.map((p) => p.slug);
  let existingSlugs = new Set<string>();
  const existingModuleBySlug = new Map<string, string>();
  let existingNotInSheet = 0;

  if (validSlugs.length > 0 || mode === 'preview') {
    const { data: existing } = await admin
      .from('lessons')
      .select('slug, module_id')
      .eq('course_id', course.id);
    const all = new Set((existing ?? []).map((r) => r.slug));
    for (const row of existing ?? []) {
      if (row.module_id) existingModuleBySlug.set(row.slug, row.module_id);
    }
    existingSlugs = new Set(validSlugs.filter((s) => all.has(s)));
    existingNotInSheet = [...all].filter((s) => !validSlugs.includes(s)).length;
  }

  const validPreview = parsed.valid.map((p) => ({
    rowIndex: p.rowIndex,
    num: p.num,
    slug: p.slug,
    title: p.title,
    vimeoId: p.vimeoId,
    duration: p.duration,
    body: p.body,
    action: existingSlugs.has(p.slug) ? ('update' as const) : ('insert' as const),
  }));

  if (mode === 'preview') {
    return NextResponse.json({
      mode,
      courseId: course.id,
      courseTitle: course.title,
      total: parsed.total,
      valid: validPreview,
      errors: parsed.errors,
      existingNotInSheet,
      ...(wantsDebug
        ? {
            debug: {
              format,
              rawExtractedText: rawExtractedText?.slice(0, 8000) ?? null,
              parse: debugBag.value ?? null,
            },
          }
        : {}),
    });
  }

  // --- commit ---
  if (parsed.valid.length === 0) {
    return NextResponse.json({
      mode,
      courseId: course.id,
      courseTitle: course.title,
      total: parsed.total,
      valid: validPreview,
      errors: parsed.errors,
      existingNotInSheet,
      inserted: 0,
      updated: 0,
      writeErrors: [],
    });
  }

  // Lessons are NOT NULL on module_id (since migration 012). For NEW slugs we
  // need a module to insert into. Prefer the course's first module by position;
  // create a default "module-1" if the course has none yet.
  let defaultModuleId: string | null = null;
  {
    const { data: mods, error: modsErr } = await admin
      .from('modules')
      .select('id')
      .eq('course_id', course.id)
      .order('position', { ascending: true })
      .limit(1);
    if (modsErr) {
      return NextResponse.json({ error: 'db_error', message: modsErr.message }, { status: 500 });
    }
    if (mods && mods.length > 0) {
      defaultModuleId = mods[0].id;
    } else {
      const { data: created, error: createErr } = await admin
        .from('modules')
        .insert({
          course_id: course.id,
          num: 1,
          slug: 'module-1',
          title: 'מודול 1',
          position: 0,
        })
        .select('id')
        .single();
      if (createErr || !created) {
        return NextResponse.json(
          { error: 'module_create_failed', message: createErr?.message ?? 'unknown' },
          { status: 500 }
        );
      }
      defaultModuleId = created.id;
    }
  }

  const rowsToWrite = parsed.valid.map((p: ParsedLesson) => ({
    course_id: course.id,
    // Preserve existing lesson's module_id on update; use default for inserts.
    module_id: existingModuleBySlug.get(p.slug) ?? defaultModuleId,
    num: p.num,
    slug: p.slug,
    title: p.title,
    vimeo_id: p.vimeoId,
    duration: p.duration,
    body: p.body,
    position: p.position,
  }));

  const writeErrors: { slug: string; message: string }[] = [];
  const { error: upsertErr } = await admin
    .from('lessons')
    .upsert(rowsToWrite, { onConflict: 'course_id,slug' });

  if (upsertErr) {
    writeErrors.push({ slug: '*', message: upsertErr.message });
  }

  const inserted = parsed.valid.filter((p) => !existingSlugs.has(p.slug)).length;
  const updated = parsed.valid.length - inserted;

  return NextResponse.json({
    mode,
    courseId: course.id,
    courseTitle: course.title,
    total: parsed.total,
    valid: validPreview,
    errors: parsed.errors,
    existingNotInSheet,
    inserted: writeErrors.length === 0 ? inserted : 0,
    updated: writeErrors.length === 0 ? updated : 0,
    writeErrors,
  });
}

/**
 * Convert mammoth HTML output to plain text while preserving Vimeo URLs that
 * Word stored as hyperlinks. The prose parser expects each Vimeo URL to appear
 * on its own line, so we inject `\nURL\n` right after the link's visible text.
 */
function htmlToTextWithLinks(html: string): string {
  let out = html;

  // Standalone-link paragraph: <p>{maybe wrappers}<a href="vimeo">x</a>{maybe wrappers}</p>
  // → replace the whole <p> with just <p>URL</p>. This drops generic visible text
  // like "צפה בסרטון" / "לחצו כאן" so it can't be mistaken for the lesson title.
  out = out.replace(
    /<p\b[^>]*>(?:\s|<(?:strong|em|b|i|span|u)\b[^>]*>|<\/(?:strong|em|b|i|span|u)>)*<a\b[^>]*\bhref="(https?:\/\/(?:www\.)?(?:vimeo\.com|player\.vimeo\.com)\/[^"]+)"[^>]*>[\s\S]*?<\/a>(?:\s|<(?:strong|em|b|i|span|u)\b[^>]*>|<\/(?:strong|em|b|i|span|u)>)*<\/p>/gi,
    (_m, url: string) => `<p>${url}</p>`
  );

  // Remaining inline <a href="vimeo">TEXT</a> (text + link mixed in same paragraph)
  // — keep the visible text AND inject the URL after it
  out = out.replace(
    /<a\b[^>]*\bhref="(https?:\/\/(?:www\.)?(?:vimeo\.com|player\.vimeo\.com)\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, url: string, inner: string) => `${stripTags(inner)}\n${url}\n`
  );

  // Non-Vimeo <a> tags — keep visible text only
  out = out.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (_m, inner: string) => stripTags(inner));

  // Block-level tags → newline boundaries
  out = out.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
  out = out.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  out = out.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  out = out
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return out;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
