import { NextRequest, NextResponse } from 'next/server';
import { parseVimeoInput, vimeoUrl } from '@/lib/learn/vimeo';

export const dynamic = 'force-dynamic';

// Fetches Vimeo's oEmbed metadata (public, no auth) for a given video URL/ID.
// Returns title + duration label + thumbnail URL. Best-effort — returns 200 with
// { ok: false, reason } on failure so the admin UI can degrade gracefully.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, reason: 'invalid body' }, { status: 400 });
  }
  const input = String(body.input || body.vimeoId || '').trim();
  const parsed = parseVimeoInput(input);
  if (!parsed) {
    return NextResponse.json({ ok: false, reason: 'unparseable' });
  }

  const target = vimeoUrl(parsed);
  const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(target)}`;

  try {
    const res = await fetch(oembedUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        reason: `vimeo ${res.status}`,
        parsed,
      });
    }
    const data = await res.json();
    const seconds = typeof data.duration === 'number' ? data.duration : 0;
    return NextResponse.json({
      ok: true,
      parsed,
      title: data.title || '',
      thumbnail: data.thumbnail_url || '',
      durationSec: seconds,
      durationLabel: formatDuration(seconds),
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      reason: e instanceof Error ? e.message : 'fetch failed',
      parsed,
    });
  }
}

function formatDuration(totalSec: number): string {
  if (!totalSec || totalSec < 0) return '';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m >= 1) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}
