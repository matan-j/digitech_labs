import { NextResponse } from 'next/server';
import { getCurrentUser, getMyCreator } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// A creator may edit branding/profile fields only — NOT status, user_id,
// is_featured or sort_order (admin-controlled).
const SELF_EDITABLE = [
  'name',
  'avatar_url',
  'banner_url',
  'bio',
  'role_title',
  'intro_video_url',
  'website',
  'linkedin',
  'instagram',
  'youtube',
  'tiktok',
  'email',
  'contact_email',
  'seo_title',
  'seo_description',
  'og_image_url',
] as const;

export async function PUT(request: Request) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const creator = await getMyCreator();
  if (!creator || creator.status !== 'active') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const f of SELF_EDITABLE) {
    if (f in body) update[f] = body[f];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }
  update.updated_by = auth.userId;

  const supabase = await createClient();
  // RLS (creators_update_own) guarantees the row is the caller's own.
  const { data, error } = await supabase
    .from('creators')
    .update(update)
    .eq('id', creator.id)
    .select('*')
    .single();
  if (error) {
    console.error('[creator:profile:update]', error);
    return NextResponse.json({ error: 'update_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}
