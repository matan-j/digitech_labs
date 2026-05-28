import { NextRequest, NextResponse } from 'next/server';
import { readStatus, writeStatus } from '@/lib/fileSystem';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  let body: { decision: 'approve' | 'reject' };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.decision !== 'approve' && body.decision !== 'reject') {
    return NextResponse.json({ error: 'decision must be approve or reject' }, { status: 400 });
  }

  const existing = await readStatus(slug) || {};
  await writeStatus(slug, {
    ...existing,
    approvalStatus: body.decision === 'approve' ? 'approved' : 'rejected',
  });

  return NextResponse.json({ ok: true, slug, decision: body.decision });
}
