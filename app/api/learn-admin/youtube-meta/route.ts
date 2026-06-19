import { NextRequest, NextResponse } from 'next/server';
import { parseYouTubeInput, youtubeUrl, youtubeThumbnailUrl } from '@/lib/learn/youtube';

export const dynamic = 'force-dynamic';

// Fetches YouTube's oEmbed metadata (public, no auth/key) for a given URL/ID.
// Returns title + thumbnail. Best-effort — returns 200 with { ok: false, reason }
// on failure so the admin UI can degrade gracefully. (Duration is not available
// via oEmbed; would require YouTube Data API + key.)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, reason: 'invalid body' }, { status: 400 });
  }
  const input = String(body.input || body.youtubeId || '').trim();
  const parsed = parseYouTubeInput(input);
  if (!parsed) {
    return NextResponse.json({ ok: false, reason: 'unparseable' });
  }

  const target = youtubeUrl(parsed);
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(target)}&format=json`;

  try {
    const res = await fetch(oembedUrl, { cache: 'no-store' });
    if (!res.ok) {
      // Still a recognizable ID — return a thumbnail URL guess so the admin
      // can preview/use it even when oEmbed fails (private/age-gated videos).
      return NextResponse.json({
        ok: true,
        parsed,
        id: parsed.id,
        title: '',
        thumbnail: youtubeThumbnailUrl(parsed.id, 'hq'),
        durationLabel: '',
        meta_warning: `oembed ${res.status}`,
      });
    }
    const data = await res.json();
    return NextResponse.json({
      ok: true,
      parsed,
      id: parsed.id,
      title: data.title || '',
      thumbnail: data.thumbnail_url || youtubeThumbnailUrl(parsed.id),
      author: data.author_name || '',
      durationLabel: '',
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      parsed,
      id: parsed.id,
      title: '',
      thumbnail: youtubeThumbnailUrl(parsed.id, 'hq'),
      durationLabel: '',
      meta_warning: e instanceof Error ? e.message : 'fetch failed',
    });
  }
}
