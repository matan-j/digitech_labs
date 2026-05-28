import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const lessonId: string | undefined = body.lesson_id;
  if (!lessonId) return NextResponse.json({ error: 'lesson_id_required' }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from('progress')
    .upsert(
      { user_id: auth.userId, lesson_id: lessonId },
      { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
    );
  if (error) {
    console.error('[progress:mark]', error);
    return NextResponse.json({ error: 'save_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ items: [] });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id, completed_at')
    .eq('user_id', auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
