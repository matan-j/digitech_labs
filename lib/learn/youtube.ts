export type YouTubeParsed = { id: string };

/**
 * Parse various YouTube input shapes:
 *   - "dQw4w9WgXcQ"                                  (bare 11-char id)
 *   - "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   - "https://youtu.be/dQw4w9WgXcQ"
 *   - "https://www.youtube.com/embed/dQw4w9WgXcQ"
 *   - "https://www.youtube.com/shorts/dQw4w9WgXcQ"
 *   - "https://m.youtube.com/watch?v=dQw4w9WgXcQ"
 * Returns null on anything we can't confidently parse.
 */
export function parseYouTubeInput(input: string): YouTubeParsed | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare 11-char id (YouTube ids are always 11 chars: [A-Za-z0-9_-])
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return { id: trimmed };

  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '').toLowerCase();

  if (host === 'youtu.be') {
    const id = u.pathname.split('/').filter(Boolean)[0];
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? { id } : null;
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'watch') {
      const id = u.searchParams.get('v');
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? { id } : null;
    }
    if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'v') && parts[1]) {
      return /^[A-Za-z0-9_-]{11}$/.test(parts[1]) ? { id: parts[1] } : null;
    }
  }

  return null;
}

/** Canonical watch URL we store/display. */
export function youtubeUrl(parsed: YouTubeParsed): string {
  return `https://www.youtube.com/watch?v=${parsed.id}`;
}

/** Embed URL for iframes. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/**
 * High-quality thumbnail URL. `maxresdefault` exists for most uploaded videos;
 * `hqdefault` is a safe fallback.
 */
export function youtubeThumbnailUrl(id: string, size: 'max' | 'hq' = 'max'): string {
  const file = size === 'max' ? 'maxresdefault' : 'hqdefault';
  return `https://i.ytimg.com/vi/${id}/${file}.jpg`;
}

/**
 * Try to derive a YouTube id from any video_url string. Returns null if the
 * url is not a recognizable YouTube link (e.g. Vimeo).
 */
export function youtubeIdFromUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl) return null;
  const parsed = parseYouTubeInput(videoUrl);
  return parsed ? parsed.id : null;
}
