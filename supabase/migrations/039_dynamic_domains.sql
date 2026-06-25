-- 039_dynamic_domains.sql
-- Promote the previously-fixed domain taxonomy to an admin-managed table so new
-- domains can be added from the admin UI.
--
-- DESIGN RULES (consistent with 013 / 037):
--   * Additive + loosening only. We DROP the old CHECK constraints that pinned
--     *.domain to the original 6 ids, and introduce a `domains` table seeded
--     with those exact 6 (same ids/labels/colors) so nothing changes for
--     existing rows. No FK is added — domain columns stay plain text so a
--     deleted domain never cascades into content; the app guards deletion of an
--     in-use domain at the service layer instead.
--   * `id` is the lowercase slug already stored in content_items.domain etc.
--   * `color` is constrained to a fixed Tailwind palette so the frontend can
--     compose static (non-purged) classes.
--
-- ⚠️ RLS CHANGE — review + apply per the project's RLS approval process (CLAUDE.md).
--   Run this in the Supabase SQL editor. The frontend falls back to the original
--   6 domains until this table exists, so deploying the app before this is safe.

-- ============================================================
-- 1. domains — the domain definition (admin-authored)
-- ============================================================

create table if not exists public.domains (
  id text primary key
    check (id = lower(id) and length(id) between 2 and 40),
  label text not null,
  -- Tailwind color name; the app derives bg/text/border classes from it.
  color text not null default 'slate'
    check (color in (
      'purple','indigo','emerald','amber','blue','slate',
      'rose','teal','cyan','orange','fuchsia','lime','sky','pink'
    )),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists domains_sort_idx on public.domains(sort_order);

drop trigger if exists domains_set_updated_at on public.domains;
create trigger domains_set_updated_at
  before update on public.domains
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. Seed the original fixed 6 (idempotent) — same ids/labels/colors
--    as the hardcoded list in lib/learn/domains.ts.
-- ============================================================

insert into public.domains (id, label, color, sort_order) values
  ('marketing', 'שיווק',      'purple',  10),
  ('ai',        'AI',         'indigo',  20),
  ('sales',     'מכירות',     'emerald', 30),
  ('design',    'עיצוב',      'amber',   40),
  ('business',  'עסקים',      'blue',    50),
  ('tech',      'טכנולוגיה',  'slate',   60)
on conflict (id) do nothing;

-- ============================================================
-- 3. Drop the old CHECK constraints that pinned domain to the 6.
--    `if exists` keeps this safe whether or not each constraint is present.
-- ============================================================

alter table public.content_items drop constraint if exists content_items_domain_check;
alter table public.playbooks      drop constraint if exists playbooks_domain_check;
alter table public.categories     drop constraint if exists categories_domain_check;
alter table public.playlists      drop constraint if exists playlists_domain_check;

-- ============================================================
-- 4. RLS — definitions are public-readable (catalog needs labels/colors),
--    admin-only for writes. Mirrors the categories policy from 013.
-- ============================================================

alter table public.domains enable row level security;

drop policy if exists "domains_select_public" on public.domains;
create policy "domains_select_public"
  on public.domains for select
  using (true);

drop policy if exists "domains_admin_write" on public.domains;
create policy "domains_admin_write"
  on public.domains for all
  using (public.is_admin())
  with check (public.is_admin());
