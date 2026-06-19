import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ContentType, GuideContentKind } from '@/lib/learn/types';
import { resolveWriteActor, validateContentUrl, type WriteActor } from '@/lib/learn/content-write';

const VALID_TYPES: ContentType[] = ['course', 'guide'];

// Fields a creator OR admin may update.
const BASE_FIELDS = [
  'title',
  'tagline',
  'description',
  'cover_url',
  'cover_style',
  'audience',
  'tags',
  'status',
  'is_premium',
  'body',
  'video_url',
  'domain',
  'content_kind',
  'content_url',
  'duration_minutes',
  'seo_title',
  'seo_description',
  'og_image_url',
] as const;

// Admin-only fields.
const ADMIN_ONLY_FIELDS = ['is_featured', 'creator_id'] as const;

type Row = {
  id: string;
  creator_id: string | null;
  content_kind: GuideContentKind | null;
  content_url: string | null;
};

/** Returns the row if the actor may write it, else an error response. */
function authorize(actor: WriteActor, row: Row): { ok: true } | { ok: false; status: number } {
  if (actor.kind === 'none') return { ok: false, status: 403 };
  if (actor.kind === 'admin') return { ok: true };
  // creator
  if (row.creator_id && row.creator_id === actor.creatorId) return { ok: true };
  return { ok: false, status: 403 };
}

export async function PUT(request: Request, ctx: { params: Promise<{ type: string; slug: string }> }) {
  const actor = await resolveWriteActor();
  if (actor.kind === 'none') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { type, slug } = await ctx.params;
  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch the existing row (for ownership + effective kind/url).
  const { data: existing, error: fErr } = await supabase
    .from('content_items')
    .select('id, creator_id, content_kind, content_url')
    .eq('type', type)
    .eq('slug', slug)
    .single();
  if (fErr || !existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const authz = authorize(actor, existing as Row);
  if (!authz.ok) return NextResponse.json({ error: 'forbidden' }, { status: authz.status });

  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const field of BASE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  // Admin-only fields applied only for admins.
  if (actor.kind === 'admin') {
    for (const field of ADMIN_ONLY_FIELDS) {
      if (field in body) update[field] = body[field];
    }
  }

  // Validate guide content_url against effective kind whenever either changes.
  if ('content_kind' in body || 'content_url' in body) {
    const effKind = (('content_kind' in body ? body.content_kind : (existing as Row).content_kind) ?? null) as GuideContentKind | null;
    const effUrl = 'content_url' in body ? body.content_url : (existing as Row).content_url;
    const check = validateContentUrl(effKind, effUrl);
    if (!check.ok) {
      return NextResponse.json({ error: 'invalid_video_url', message: check.message }, { status: 400 });
    }
    update.content_url = check.value;
  }

  if (update.status === 'published' && !('published_at' in body)) {
    update.published_at = new Date().toISOString();
  }
  update.updated_by = actor.userId;

  const hasCategoryUpdate = Array.isArray(body.category_ids);

  const { data, error } = await supabase
    .from('content_items')
    .update(update)
    .eq('type', type)
    .eq('slug', slug)
    .select('*')
    .single();
  if (error) {
    console.error('[content:update]', error);
    return NextResponse.json({ error: 'update_failed', message: error.message }, { status: 500 });
  }
  const updated = data;

  // Sync categories — delete-then-insert keeps the call simple and correct.
  if (hasCategoryUpdate && updated) {
    const desired: string[] = (body.category_ids as unknown[])
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const { error: dErr } = await supabase
      .from('content_item_categories')
      .delete()
      .eq('content_item_id', updated.id);
    if (dErr) console.error('[content:update:cats:delete]', dErr);

    if (desired.length > 0) {
      const rows = desired.map((category_id) => ({ content_item_id: updated.id, category_id }));
      const { error: iErr } = await supabase.from('content_item_categories').insert(rows);
      if (iErr) console.error('[content:update:cats:insert]', iErr);
    }
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ type: string; slug: string }> }) {
  const actor = await resolveWriteActor();
  if (actor.kind === 'none') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { type, slug } = await ctx.params;
  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }
  const supabase = await createClient();

  const { data: existing, error: fErr } = await supabase
    .from('content_items')
    .select('id, creator_id, content_kind, content_url')
    .eq('type', type)
    .eq('slug', slug)
    .single();
  if (fErr || !existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const authz = authorize(actor, existing as Row);
  if (!authz.ok) return NextResponse.json({ error: 'forbidden' }, { status: authz.status });

  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('type', type)
    .eq('slug', slug);
  if (error) {
    return NextResponse.json({ error: 'delete_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
