import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdmin } from '@/lib/auth';

/**
 * Downloadable .xlsx template for bulk lesson import.
 * Generated on the fly so headers always match current `bulkImport.ts`.
 */

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;

  const headers = ['מספר', 'כותרת', 'קישור Vimeo', 'slug', 'משך', 'תקציר'];
  const sample = [
    [1, 'פתיחה ומבוא', 'https://vimeo.com/76979871', 'intro', '04:12', 'מה נלמד בקורס'],
    [2, 'פרק 1 — מושגי יסוד', 'https://vimeo.com/123456789', 'chapter-1-basics', '11:08', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);

  ws['!cols'] = [
    { wch: 8 },
    { wch: 30 },
    { wch: 38 },
    { wch: 24 },
    { wch: 10 },
    { wch: 40 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'lessons');

  const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="lessons-template-${slug}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
