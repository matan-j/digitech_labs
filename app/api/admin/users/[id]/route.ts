import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const role: 'admin' | 'subscriber' | 'creator' | undefined = body.role;
  if (role !== 'admin' && role !== 'subscriber' && role !== 'creator') {
    return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error } = await admin.from('profiles').update({ role }).eq('id', id);
  if (error) return NextResponse.json({ error: 'update_failed', message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, role });
}
