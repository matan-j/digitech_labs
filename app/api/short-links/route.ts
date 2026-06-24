import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateCode(len = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = '';
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

// Only accept same-origin relative paths — never an absolute URL or a
// protocol-relative '//evil.com' that could turn the redirect into an open
// redirect.
function isSafePath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

/**
 * Mint (or reuse) a short code for a same-origin target path.
 * Stable: the same target_path always returns the same code thanks to the
 * UNIQUE(target_path) constraint, so re-sharing a course never duplicates.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const path = body.path;
  if (!isSafePath(path)) {
    return NextResponse.json({ error: 'invalid_path' }, { status: 400 });
  }

  const supabase = await createClient();

  // Reuse an existing short link for this target if one exists.
  const { data: existing } = await supabase
    .from('short_links')
    .select('code')
    .eq('target_path', path)
    .maybeSingle();
  if (existing) return NextResponse.json({ code: existing.code });

  // Otherwise mint a new one, retrying on the rare random-code collision.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from('short_links')
      .insert({ target_path: path, code })
      .select('code')
      .single();

    if (!error && data) return NextResponse.json({ code: data.code });

    // 23505 = unique violation. Either target_path was created concurrently
    // (reuse it) or the code clashed (retry with a fresh code).
    if (error?.code === '23505') {
      const { data: row } = await supabase
        .from('short_links')
        .select('code')
        .eq('target_path', path)
        .maybeSingle();
      if (row) return NextResponse.json({ code: row.code });
      continue;
    }

    console.error('[short-links:create]', error);
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }

  return NextResponse.json({ error: 'code_exhausted' }, { status: 500 });
}
