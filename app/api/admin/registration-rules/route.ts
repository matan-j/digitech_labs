import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { listRegistrationRules } from '@/lib/learn/db';
import { sanitizeRule, sanitizeGrants } from './_sanitize';

export async function GET() {
  await requireAdmin();
  const items = await listRegistrationRules();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json().catch(() => ({}));
  const fields = sanitizeRule(body, false);
  const grants = sanitizeGrants(body) ?? [];

  if (!fields.name) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: rule, error } = await supabase
    .from('registration_rules')
    .insert(fields)
    .select('*')
    .single();
  if (error || !rule) {
    return NextResponse.json({ error: 'create_failed', message: error?.message }, { status: 500 });
  }

  if (grants.length) {
    const rows = grants.map((g, i) => ({ ...g, rule_id: rule.id, position: i }));
    const { error: grantsErr } = await supabase.from('registration_rule_grants').insert(rows);
    if (grantsErr) {
      return NextResponse.json({ error: 'grants_failed', message: grantsErr.message }, { status: 500 });
    }
  }

  const { data: savedGrants } = await supabase
    .from('registration_rule_grants')
    .select('*')
    .eq('rule_id', rule.id)
    .order('position', { ascending: true });

  return NextResponse.json({ item: { ...rule, grants: savedGrants ?? [] } });
}
