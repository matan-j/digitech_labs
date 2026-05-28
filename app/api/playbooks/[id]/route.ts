import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { error } = await supabase.from('playbooks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'delete_failed', message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
