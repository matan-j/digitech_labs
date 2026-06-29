import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { grantPurchaseAccess } from '@/lib/payments/entitlement-service';
import type { GrantResourceType } from '@/lib/learn/registration-rules';

/**
 * Retroactively grant a rule's resources to users who ALREADY registered inside
 * its window. Forward grants happen automatically in handle_new_user(); this
 * covers existing users (e.g. when a rule is created for a past window).
 *
 * Uses grantPurchaseAccess() so bundles expand to per-course entitlements too.
 * Idempotent — re-running adds nothing new (unique constraint + upsert).
 */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const supabase = createServiceClient();

  const { data: rule, error: ruleErr } = await supabase
    .from('registration_rules')
    .select('id, starts_at, ends_at')
    .eq('id', id)
    .single();
  if (ruleErr || !rule) {
    return NextResponse.json({ error: 'not_found', message: ruleErr?.message }, { status: 404 });
  }

  const { data: grants, error: grantsErr } = await supabase
    .from('registration_rule_grants')
    .select('resource_type, resource_id')
    .eq('rule_id', id);
  if (grantsErr) {
    return NextResponse.json({ error: 'grants_failed', message: grantsErr.message }, { status: 500 });
  }
  if (!grants || grants.length === 0) {
    return NextResponse.json({ grantedUsers: 0, totalGrants: 0 });
  }

  // Users whose registration falls inside the window (nulls = open-ended).
  let q = supabase.from('profiles').select('id');
  if (rule.starts_at) q = q.gte('created_at', rule.starts_at);
  if (rule.ends_at) q = q.lte('created_at', rule.ends_at);
  const { data: users, error: usersErr } = await q;
  if (usersErr) {
    return NextResponse.json({ error: 'users_failed', message: usersErr.message }, { status: 500 });
  }

  let totalGrants = 0;
  for (const u of users ?? []) {
    const userId = (u as { id: string }).id;
    for (const g of grants) {
      await grantPurchaseAccess({
        userId,
        resourceType: (g as { resource_type: GrantResourceType }).resource_type,
        resourceId: (g as { resource_id: string }).resource_id,
        source: 'registration_rule',
      });
      totalGrants += 1;
    }
  }

  return NextResponse.json({ grantedUsers: (users ?? []).length, totalGrants });
}
