-- 044_registration_rules.sql
-- Admin-managed cohort auto-grant by registration date.
--
-- GOAL
--   An admin defines a RULE: a date window [starts_at, ends_at] (both nullable =
--   open-ended) plus a set of selected courses/bundles. Any NEW user whose
--   auth.users.created_at falls inside an active rule's window automatically and
--   immediately receives entitlements to those resources at signup time.
--
-- DESIGN RULES
--   * Additive only. No drops/renames of existing columns.
--   * Granting happens INSIDE handle_new_user() (security definer, fires on every
--     signup path — email + OAuth). The grant block is wrapped in an
--     exception-swallowing sub-block so a grant failure NEVER rolls back signup.
--   * A single 'bundle' entitlement is enough — has_entitlement('course', id) is
--     already bundle-aware (migration 042), so contained courses unlock too.
--   * Access is permanent (expires_at left null). The window only decides WHO is
--     eligible, not how long access lasts. Disabling/deleting a rule stops only
--     future grants — already-granted entitlements are kept.

-- ============================================================
-- 1. registration_rules — the rule (window + metadata)
-- ============================================================

create table if not exists public.registration_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default false,
  starts_at timestamptz,           -- null = open-ended start
  ends_at timestamptz,             -- null = open-ended end
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. registration_rule_grants — resources a rule grants (course/bundle)
-- ============================================================

create table if not exists public.registration_rule_grants (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.registration_rules(id) on delete cascade,
  resource_type text not null check (resource_type in ('course','bundle')),
  resource_id uuid not null,
  position int not null default 0,
  unique (rule_id, resource_type, resource_id)
);

create index if not exists registration_rules_enabled_idx
  on public.registration_rules(enabled);
create index if not exists registration_rule_grants_rule_idx
  on public.registration_rule_grants(rule_id);

drop trigger if exists registration_rules_set_updated_at on public.registration_rules;
create trigger registration_rules_set_updated_at
  before update on public.registration_rules
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. Widen entitlements.source to allow 'registration_rule'
-- ============================================================

alter table public.entitlements drop constraint if exists entitlements_source_check;
alter table public.entitlements
  add constraint entitlements_source_check
  check (source in ('purchase','admin','migration','gift','registration_rule'));

-- ============================================================
-- 4. RLS — admin only (not public-facing). The trigger and the admin API
--    both use the service client, which bypasses RLS, so no public policy.
-- ============================================================

alter table public.registration_rules enable row level security;
create policy "registration_rules_admin_all"
  on public.registration_rules for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.registration_rule_grants enable row level security;
create policy "registration_rule_grants_admin_all"
  on public.registration_rule_grants for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Extend handle_new_user() — keep the profile insert as-is, then grant
--    matching registration rules. Best-effort: never break signup.
--    Replaces the function body only; the trigger binding is unchanged.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- (unchanged from 027) create the profile; only the email path imports a name.
  insert into public.profiles (id, full_name)
  values (
    new.id,
    case
      when coalesce(new.raw_app_meta_data->>'provider', 'email') = 'email'
        then new.raw_user_meta_data->>'full_name'
      else null
    end
  );

  -- Registration-rule auto-grant. Wrapped so any failure here is swallowed and
  -- NEVER rolls back the signup (the single most important safety property).
  begin
    insert into public.entitlements
      (user_id, resource_type, resource_id, source, status, granted_at)
    select
      new.id, g.resource_type, g.resource_id, 'registration_rule', 'active', now()
    from public.registration_rules r
    join public.registration_rule_grants g on g.rule_id = r.id
    where r.enabled = true
      and (r.starts_at is null or new.created_at >= r.starts_at)
      and (r.ends_at   is null or new.created_at <= r.ends_at)
    on conflict (user_id, resource_type, resource_id) do nothing;
  exception when others then
    raise warning 'handle_new_user: registration-rule grant failed for %: %',
      new.id, sqlerrm;
  end;

  return new;
end;
$$;
