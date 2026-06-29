import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { sanitizeRule, sanitizeGrants } from '../_sanitize';

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const fields = sanitizeRule(body, true);
  const grants = sanitizeGrants(body); // null = body had no `grants` key → leave as-is

  if ('name' in fields && !fields.name) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 });
  }
  if (Object.keys(fields).length === 0 && grants === null) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  const supabase = createServiceClient();

  let rule;
  if (Object.keys(fields).length > 0) {
    const { data, error } = await supabase
      .from('registration_rules')
      .update(fields)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) {
      return NextResponse.json({ error: 'update_failed', message: error?.message }, { status: 500 });
    }
    rule = data;
  } else {
    const { data, error } = await supabase
      .from('registration_rules')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: 'not_found', message: error?.message }, { status: 404 });
    }
    rule = data;
  }

  // Replace-set the grants when the body included them.
  if (grants !== null) {
    const { error: delErr } = await supabase
      .from('registration_rule_grants')
      .delete()
      .eq('rule_id', id);
    if (delErr) {
      return NextResponse.json({ error: 'grants_failed', message: delErr.message }, { status: 500 });
    }
    if (grants.length) {
      const rows = grants.map((g, i) => ({ ...g, rule_id: id, position: i }));
      const { error: insErr } = await supabase.from('registration_rule_grants').insert(rows);
      if (insErr) {
        return NextResponse.json({ error: 'grants_failed', message: insErr.message }, { status: 500 });
      }
    }
  }

  const { data: savedGrants } = await supabase
    .from('registration_rule_grants')
    .select('*')
    .eq('rule_id', id)
    .order('position', { ascending: true });

  return NextResponse.json({ item: { ...rule, grants: savedGrants ?? [] } });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const supabase = createServiceClient();
  // grants cascade via FK on delete.
  const { error } = await supabase.from('registration_rules').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'delete_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
