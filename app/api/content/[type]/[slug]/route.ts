import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { ContentType } from '@/lib/learn/types';

const VALID_TYPES: ContentType[] = ['course', 'guide'];
const UPDATABLE_FIELDS = [
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
] as const;

export async function PUT(request: Request, ctx: { params: Promise<{ type: string; slug: string }> }) {
  await requireAdmin();
  const { type, slug } = await ctx.params;
  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  if (update.status === 'published' && !('published_at' in body)) {
    update.published_at = new Date().toISOString();
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  const supabase = await createClient();
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
  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ type: string; slug: string }> }) {
  await requireAdmin();
  const { type, slug } = await ctx.params;
  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }
  const supabase = await createClient();
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
