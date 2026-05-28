export type VimeoParsed = { id: string; hash?: string };

/**
 * Parse various Vimeo input shapes the user might paste:
 *   - "76979871"
 *   - "https://vimeo.com/76979871"
 *   - "http://vimeo.com/76979871"
 *   - "vimeo.com/76979871"
 *   - "https://vimeo.com/76979871/abcd1234"   (private video with hash)
 *   - "https://player.vimeo.com/video/76979871"
 * Returns null on anything we can't confidently parse.
 */
export function parseVimeoInput(input: string): VimeoParsed | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare numeric id
  if (/^\d{5,}$/.test(trimmed)) return { id: trimmed };

  // URL forms
  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;

  // player.vimeo.com/video/<id>
  // vimeo.com/<id>[/<hash>]
  const parts = u.pathname.split('/').filter(Boolean);
  let id: string | undefined;
  let hash: string | undefined;

  if (host === 'player.vimeo.com') {
    const vi = parts.indexOf('video');
    if (vi >= 0 && parts[vi + 1] && /^\d+$/.test(parts[vi + 1])) {
      id = parts[vi + 1];
    }
  } else {
    if (parts[0] && /^\d+$/.test(parts[0])) {
      id = parts[0];
      if (parts[1] && /^[A-Za-z0-9]+$/.test(parts[1])) hash = parts[1];
    }
  }

  return id ? { id, hash } : null;
}

/** Build the canonical Vimeo URL we'd display back to the user. */
export function vimeoUrl(parsed: VimeoParsed): string {
  return parsed.hash
    ? `https://vimeo.com/${parsed.id}/${parsed.hash}`
    : `https://vimeo.com/${parsed.id}`;
}
