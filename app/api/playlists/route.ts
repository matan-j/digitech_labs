import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveWriteActor } from '@/lib/learn/content-write';

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[֐-׿]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function POST(request: Request) {
  const actor = await resolveWriteActor();
  if (actor.kind === 'none') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const title = (body.title ?? '').toString().trim();
  if (!title) return NextResponse.json({ error: 'title_required' }, { status: 400 });

  // Creator owns the playlist; admin must specify creator_id.
  const creatorId = actor.kind === 'creator' ? actor.creatorId : (body.creator_id ?? null);
  if (!creatorId) return NextResponse.json({ error: 'creator_required' }, { status: 400 });

  const supabase = await createClient();

  const slugBase = (body.slug ?? '').toString().trim() || slugify(title) || `playlist-${Date.now()}`;
  let slug = slugBase;
  for (let n = 2; n < 50; n++) {
    const { count } = await supabase
      .from('playlists')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', creatorId)
      .eq('slug', slug);
    if ((count ?? 0) === 0) break;
    slug = `${slugBase}-${n}`;
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      creator_id: creatorId,
      slug,
      title,
      description: body.description ?? null,
      thumbnail_url: body.thumbnail_url ?? null,
      domain: body.domain ?? null,
      status: 'draft',
      is_featured: actor.kind === 'admin' ? (body.is_featured ?? false) : false,
      sort_order: actor.kind === 'admin' && typeof body.sort_order === 'number' ? body.sort_order : 0,
      created_by: actor.userId,
      updated_by: actor.userId,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[playlists:create]', error);
    return NextResponse.json({ error: 'create_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}
