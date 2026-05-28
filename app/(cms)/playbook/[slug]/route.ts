import { NextRequest } from 'next/server';
import { readFile } from '@/lib/fileSystem';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const html = await readFile(slug, 'playbook.html');
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new Response(
      `<html dir="rtl" lang="he"><body style="font-family:sans-serif;padding:2rem;background:#0F172A;color:#fff">
        <h2>הפלייבוק עדיין לא נוצר</h2>
        <p>הרץ את הפייפליין קודם, או לחץ "צור פלייבוק" בממשק הקורס.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 },
    );
  }
}
