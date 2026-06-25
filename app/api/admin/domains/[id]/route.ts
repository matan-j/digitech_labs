import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { countDomainUsage } from '@/lib/learn/db';
import { DOMAIN_COLOR_OPTIONS, type DomainColor } from '@/lib/learn/domains';

function isColor(v: unknown): v is DomainColor {
  return typeof v === 'string' && (DOMAIN_COLOR_OPTIONS as readonly string[]).includes(v);
}

// id is the immutable slug (referenced by content_items.domain etc.), so only
// label / color / sort_order are editable. Renaming the id would orphan content.
export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const update: Record<string, unknown> = {};
  if (typeof body.label === 'string' && body.label.trim()) update.label = body.label.trim();
  if ('color' in body) {
    if (!isColor(body.color)) return NextResponse.json({ error: 'invalid_color' }, { status: 400 });
    update.color = body.color;
  }
  if (typeof body.sort_order === 'number') update.sort_order = body.sort_order;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('domains')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: 'update_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;

  // Guard: don't delete a domain that content still references — domain columns
  // are plain text (no FK cascade), so this would orphan those rows' labels.
  const inUse = await countDomainUsage(id);
  if (inUse > 0) {
    return NextResponse.json(
      { error: 'domain_in_use', count: inUse, message: `התחום בשימוש ב-${inUse} פריטים. הסר אותו מהם תחילה.` },
      { status: 409 },
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('domains').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'delete_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
