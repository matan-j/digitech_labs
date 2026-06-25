import { NextResponse } from 'next/server';
import { resolveWriteActor } from '@/lib/learn/content-write';
import { createServiceClient } from '@/lib/supabase/server';
import { translateToSlug } from '@/lib/ai/slug-translate';
import { ensureUniqueSlug } from '@/lib/utils/slug';

// Live slug suggestion for the admin create forms: AI-translates the typed
// title to an English slug and de-dups it against the right table so the admin
// sees the exact, collision-free slug before submitting. Read-only (no writes),
// guarded to admins/creators. The create routes re-run the same logic on POST,
// so this is a preview — the authoritative slug is still assigned server-side.

const CONTENT_TYPES = new Set(['course', 'guide', 'bundle']);

export async function POST(request: Request) {
  const actor = await resolveWriteActor();
  if (actor.kind === 'none') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const text = (body.text ?? '').toString().trim();
  const type = (body.type ?? '').toString().trim();
  const creatorId = body.creatorId ?? body.creator_id ?? null;

  if (!text) return NextResponse.json({ slug: '', base: '' });

  const base = await translateToSlug(text);
  if (!base) return NextResponse.json({ slug: '', base: '' });

  const supabase = createServiceClient();

  let exists: (candidate: string) => Promise<boolean>;
  if (CONTENT_TYPES.has(type)) {
    exists = async (c) => {
      const { count } = await supabase
        .from('content_items')
        .select('id', { count: 'exact', head: true })
        .eq('type', type)
        .eq('slug', c);
      return (count ?? 0) > 0;
    };
  } else if (type === 'playbook') {
    exists = async (c) => {
      const { count } = await supabase
        .from('playbooks')
        .select('id', { count: 'exact', head: true })
        .eq('slug', c);
      return (count ?? 0) > 0;
    };
  } else if (type === 'creator') {
    exists = async (c) => {
      const { count } = await supabase
        .from('creators')
        .select('id', { count: 'exact', head: true })
        .eq('slug', c);
      return (count ?? 0) > 0;
    };
  } else if (type === 'category') {
    exists = async (c) => {
      const { count } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true })
        .eq('slug', c);
      return (count ?? 0) > 0;
    };
  } else if (type === 'playlist') {
    exists = async (c) => {
      let q = supabase
        .from('playlists')
        .select('id', { count: 'exact', head: true })
        .eq('slug', c);
      if (creatorId) q = q.eq('creator_id', creatorId);
      const { count } = await q;
      return (count ?? 0) > 0;
    };
  } else {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(base, exists);
  return NextResponse.json({ slug, base });
}
