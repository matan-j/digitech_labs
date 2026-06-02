'use client';

import { Fragment, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

type PreviewRow = {
  rowIndex: number;
  num: number;
  slug: string;
  title: string;
  vimeoId: string;
  duration: string | null;
  body: string | null;
  action: 'insert' | 'update';
};

type RowError = {
  rowIndex: number;
  title?: string;
  message: string;
};

type PreviewResponse = {
  mode: 'preview';
  courseTitle: string;
  total: number;
  valid: PreviewRow[];
  errors: RowError[];
  existingNotInSheet: number;
  debug?: {
    format: string;
    rawExtractedText: string | null;
    parse: {
      totalLines: number;
      anchors: { lineIdx: number; url: string; vimeoId: string | null }[];
      firstLines: string[];
    } | null;
  };
};

type CommitResponse = Omit<PreviewResponse, 'mode'> & {
  mode: 'commit';
  inserted: number;
  updated: number;
  writeErrors: { slug: string; message: string }[];
};

type Phase = 'idle' | 'uploading' | 'preview' | 'committing' | 'done' | 'error';

type Props = {
  courseSlug: string;
  courseTitle: string;
  existingLessonCount: number;
};

export default function BulkImportLessons({
  courseSlug,
  courseTitle,
  existingLessonCount,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);
    setCurrentFile(file);
    setPhase('uploading');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(
        `/api/admin/courses/${courseSlug}/bulk-import-lessons?mode=preview&debug=1`,
        { method: 'POST', body: form }
      );
      const data = await res.json();
      if (!res.ok) {
        setPhase('error');
        setError(data.message ?? data.error ?? 'שגיאה לא ידועה');
        return;
      }
      setPreview(data as PreviewResponse);
      setPhase('preview');
    } catch (err) {
      setPhase('error');
      setError(err instanceof Error ? err.message : 'שגיאת רשת');
    }
  }

  async function handleCommit() {
    if (!currentFile) return;
    setPhase('committing');
    setError(null);

    const form = new FormData();
    form.append('file', currentFile);

    try {
      const res = await fetch(
        `/api/admin/courses/${courseSlug}/bulk-import-lessons?mode=commit`,
        { method: 'POST', body: form }
      );
      const data = await res.json();
      if (!res.ok) {
        setPhase('error');
        setError(data.message ?? data.error ?? 'שגיאה בייבוא');
        return;
      }
      setCommitResult(data as CommitResponse);
      setPhase('done');
    } catch (err) {
      setPhase('error');
      setError(err instanceof Error ? err.message : 'שגיאת רשת');
    }
  }

  function reset() {
    setPhase('idle');
    setError(null);
    setFileName(null);
    setCurrentFile(null);
    setPreview(null);
    setCommitResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-6" dir="rtl">
      <header className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h1 className="text-2xl font-extrabold text-neutral-950">
          ייבוא שיעורים מקובץ Excel / CSV / Word / PDF
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          קורס: <span className="font-semibold text-neutral-900">{courseTitle}</span>
          {existingLessonCount > 0 && (
            <span className="text-neutral-500">
              {' · '}
              {existingLessonCount} שיעורים קיימים בקורס
            </span>
          )}
        </p>
      </header>

      {(phase === 'idle' || phase === 'uploading' || phase === 'error') && (
        <section className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide">
                שלב 1 — העלאת קובץ
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                .xlsx · .csv · .docx · .pdf · עד 5MB
              </p>
            </div>
            <a
              href={`/api/admin/courses/${courseSlug}/bulk-import-lessons/template`}
              className="flex items-center gap-1.5 text-xs text-brand-purple-700 hover:text-brand-purple-800 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              הורד תבנית
            </a>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv,.xls,.docx,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            disabled={phase === 'uploading'}
            className={[
              'flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed transition-colors py-10 px-4 text-sm',
              phase === 'error'
                ? 'border-red-300 text-red-700 bg-red-50'
                : phase === 'uploading'
                  ? 'border-brand-purple-300 text-brand-purple-700 bg-brand-purple-50'
                  : dragOver
                    ? 'border-brand-purple-500 text-brand-purple-800 bg-brand-purple-50'
                    : 'border-neutral-300 text-neutral-600 hover:border-brand-purple-400 hover:text-brand-purple-700 hover:bg-brand-purple-50',
            ].join(' ')}
          >
            {phase === 'uploading' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>קורא ומאמת…</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="font-semibold">לחץ או גרור קובץ לכאן</span>
                <span className="text-xs text-neutral-500">.xlsx · .csv · .docx · .pdf</span>
              </>
            )}
          </button>

          {fileName && phase !== 'uploading' && (
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {fileName}
            </div>
          )}

          {phase === 'error' && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
        </section>
      )}

      {phase === 'preview' && preview && (
        <PreviewSection
          preview={preview}
          fileName={fileName}
          onCancel={reset}
          onCommit={handleCommit}
        />
      )}

      {phase === 'committing' && (
        <section className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple-700 mx-auto" />
          <p className="mt-3 text-sm text-neutral-700 font-semibold">מייבא שיעורים…</p>
        </section>
      )}

      {phase === 'done' && commitResult && (
        <DoneSection
          result={commitResult}
          courseSlug={courseSlug}
          onAnother={reset}
        />
      )}
    </div>
  );
}

function PreviewSection({
  preview,
  fileName,
  onCancel,
  onCommit,
}: {
  preview: PreviewResponse;
  fileName: string | null;
  onCancel: () => void;
  onCommit: () => void;
}) {
  const insertCount = preview.valid.filter((v) => v.action === 'insert').length;
  const updateCount = preview.valid.length - insertCount;
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showRaw, setShowRaw] = useState(false);
  const allExpanded = expanded.size === preview.valid.length && preview.valid.length > 0;

  function toggle(rowIndex: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  }
  function toggleAll() {
    setExpanded(allExpanded ? new Set() : new Set(preview.valid.map((v) => v.rowIndex)));
  }

  return (
    <>
      <section className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-extrabold text-neutral-700 uppercase tracking-wide">
            שלב 2 — תצוגה מקדימה
          </h2>
          {fileName && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {fileName}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip tone="success" label={`${preview.valid.length} תקינים`} />
          {preview.errors.length > 0 && (
            <Chip tone="error" label={`${preview.errors.length} שגיאות`} />
          )}
          {insertCount > 0 && <Chip tone="brand" label={`${insertCount} ייווצרו חדשים`} />}
          {updateCount > 0 && <Chip tone="tech" label={`${updateCount} יושפעו לעדכון`} />}
          {preview.existingNotInSheet > 0 && (
            <Chip
              tone="neutral"
              label={`${preview.existingNotInSheet} קיימים בקורס לא יושפעו`}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          {preview.debug && (
            <button
              type="button"
              onClick={() => setShowRaw((s) => !s)}
              className="text-xs text-neutral-500 hover:text-brand-purple-700 font-semibold"
            >
              {showRaw ? 'הסתר טקסט גולמי' : 'תצוגת טקסט גולמי (debug)'}
            </button>
          )}
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-neutral-500 hover:text-brand-purple-700 font-semibold"
          >
            {allExpanded ? 'הסתר תכנים' : 'הצג תכנים של כל השיעורים'}
          </button>
        </div>

        {showRaw && preview.debug && (
          <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-xs">
            <div className="font-semibold mb-2 text-neutral-700">
              format: {preview.debug.format} · שורות לאחר ניקוי: {preview.debug.parse?.totalLines}
              {' · '}
              נקודות עיגון (Vimeo): {preview.debug.parse?.anchors.length}
            </div>
            {preview.debug.parse && (
              <div className="mb-2">
                <div className="font-semibold text-neutral-600 mb-1">נקודות עיגון:</div>
                <ul className="font-mono space-y-0.5">
                  {preview.debug.parse.anchors.map((a, i) => (
                    <li key={i}>
                      [שורה {a.lineIdx}] {a.vimeoId ?? '?'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="font-semibold text-neutral-600 mb-1">טקסט גולמי שיצא מהפרסר:</div>
            <pre className="whitespace-pre-wrap max-h-96 overflow-y-auto text-neutral-700 bg-white p-2 rounded border border-neutral-200">
              {preview.debug.rawExtractedText ?? '(לא זמין)'}
            </pre>
          </div>
        )}

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-200">
                <th className="text-start font-semibold px-5 py-2 w-8"></th>
                <th className="text-start font-semibold px-3 py-2 w-12">#</th>
                <th className="text-start font-semibold px-3 py-2">כותרת</th>
                <th className="text-start font-semibold px-3 py-2">slug</th>
                <th className="text-start font-semibold px-3 py-2">Vimeo</th>
                <th className="text-start font-semibold px-3 py-2 w-16">תווים</th>
                <th className="text-start font-semibold px-3 py-2 w-20">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {preview.errors.map((e) => (
                <tr key={`err-${e.rowIndex}`} className="bg-red-50 border-b border-red-100">
                  <td className="px-5 py-2"></td>
                  <td className="px-3 py-2 text-red-700">—</td>
                  <td className="px-3 py-2 text-red-700">{e.title ?? ''}</td>
                  <td className="px-3 py-2 text-red-700" colSpan={3}>
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{e.message}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-red-700 font-semibold">שגיאה</td>
                </tr>
              ))}
              {preview.valid.map((v) => {
                const isOpen = expanded.has(v.rowIndex);
                const bodyChars = v.body?.length ?? 0;
                return (
                  <Fragment key={`v-${v.rowIndex}`}>
                    <tr
                      onClick={() => toggle(v.rowIndex)}
                      className={`border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 ${
                        v.action === 'insert' ? 'bg-brand-purple-50/40' : 'bg-brand-blue-100/40'
                      }`}
                    >
                      <td className="px-5 py-2 text-neutral-400">
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2 text-neutral-700">{v.num}</td>
                      <td className="px-3 py-2 text-neutral-900 font-medium">{v.title}</td>
                      <td className="px-3 py-2 font-mono text-neutral-500" dir="ltr">{v.slug}</td>
                      <td className="px-3 py-2 font-mono text-neutral-500" dir="ltr">{v.vimeoId}</td>
                      <td className="px-3 py-2 text-neutral-500 font-mono">
                        {bodyChars > 0 ? bodyChars : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {v.action === 'insert' ? (
                          <span className="text-brand-purple-700 font-semibold">חדש</span>
                        ) : (
                          <span className="text-brand-blue-700 font-semibold">עדכון</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-neutral-200 bg-neutral-50/50">
                        <td></td>
                        <td colSpan={6} className="px-3 py-3">
                          {v.body ? (
                            <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-neutral-700 leading-relaxed border-r-4 border-brand-purple-200 ps-3">
                              {v.body}
                            </div>
                          ) : (
                            <div className="text-neutral-400 italic">אין תוכן טקסטואלי לשיעור זה</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onCommit}
          disabled={preview.valid.length === 0}
          className="px-5 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 disabled:bg-neutral-300 text-white text-sm font-semibold transition-colors"
        >
          ייבא {preview.valid.length} שיעורים
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-pill border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-semibold transition-colors"
        >
          בטל
        </button>
      </section>
    </>
  );
}

function DoneSection({
  result,
  courseSlug,
  onAnother,
}: {
  result: CommitResponse;
  courseSlug: string;
  onAnother: () => void;
}) {
  const hasWriteErrors = result.writeErrors.length > 0;

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
      <div className="flex items-start gap-3">
        {hasWriteErrors ? (
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div>
          <h2 className="text-lg font-extrabold text-neutral-950">
            {hasWriteErrors ? 'הייבוא הסתיים עם שגיאות' : 'הייבוא הושלם בהצלחה'}
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            {result.inserted} שיעורים נוצרו · {result.updated} עודכנו
            {result.errors.length > 0 && ` · ${result.errors.length} שורות דולגו`}
          </p>
        </div>
      </div>

      {hasWriteErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <h3 className="text-sm font-semibold text-red-800 mb-1">שגיאות כתיבה:</h3>
          <ul className="text-xs text-red-700 space-y-1">
            {result.writeErrors.map((e, i) => (
              <li key={i} className="font-mono">
                {e.slug}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
        <Link
          href={`/admin/courses/${courseSlug}`}
          className="flex items-center gap-1.5 px-5 py-2 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white text-sm font-semibold transition-colors"
        >
          חזרה לעריכת הקורס
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={onAnother}
          className="px-4 py-2 rounded-pill border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-semibold transition-colors"
        >
          ייבוא קובץ נוסף
        </button>
      </div>
    </section>
  );
}

function Chip({
  tone,
  label,
}: {
  tone: 'success' | 'error' | 'brand' | 'tech' | 'neutral';
  label: string;
}) {
  const cls = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    brand: 'bg-brand-purple-50 text-brand-purple-800 border-brand-purple-200',
    tech: 'bg-brand-blue-100 text-brand-blue-700 border-brand-blue-400',
    neutral: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  }[tone];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}
