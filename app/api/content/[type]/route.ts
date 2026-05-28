import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { ContentType } from '@/lib/learn/types';

const VALID_TYPES: ContentType[] = ['course', 'guide'];

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[֐-׿]/g, '') // strip Hebrew chars for slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function POST(request: Request, ctx: { params: Promise<{ type: string }> }) {
  const { profile } = await requireAdmin();
  const { type } = await ctx.params;
  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const title = (body.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'title_required' }, { status: 400 });

  let slug = (body.slug ?? '').trim() || slugify(title);
  if (!slug) slug = `untitled-${Date.now()}`;

  const supabase = await createClient();

  // Ensure uniqueness — append -2, -3 etc. if needed
  let candidate = slug;
  for (let n = 2; n < 50; n++) {
    const { count } = await supabase
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('type', type)
      .eq('slug', candidate);
    if ((count ?? 0) === 0) break;
    candidate = `${slug}-${n}`;
  }

  const insert = {
    type,
    slug: candidate,
    title,
    tagline: body.tagline ?? null,
    description: body.description ?? null,
    cover_url: body.cover_url ?? null,
    cover_style: body.cover_style ?? 'hero',
    audience: body.audience ?? null,
    tags: body.tags ?? [],
    status: 'draft' as const,
    is_premium: body.is_premium ?? true,
    body: body.body ?? (type === 'guide' ? [] : null),
    created_by: profile.id,
  };

  const { data, error } = await supabase
    .from('content_items')
    .insert(insert)
    .select('*')
    .single();
  if (error) {
    console.error('[content:create]', error);
    return NextResponse.json({ error: 'create_failed', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
