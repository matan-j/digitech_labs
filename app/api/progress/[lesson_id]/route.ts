import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(_request: Request, ctx: { params: Promise<{ lesson_id: string }> }) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { lesson_id } = await ctx.params;
  const supabase = await createClient();
  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('user_id', auth.userId)
    .eq('lesson_id', lesson_id);
  if (error) {
    return NextResponse.json({ error: 'delete_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
