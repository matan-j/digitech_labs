-- 010_brand_settings.sql
-- Single-row brand settings table — social links + optional cover image URL.
-- Logo stays in storage.brand (handled by migration 008). This table holds
-- the supplementary brand metadata that does not belong in storage.

create table public.brand_settings (
  id smallint primary key default 1,
  cover_url text,
  social_instagram text,
  social_facebook text,
  social_linkedin text,
  social_youtube text,
  social_tiktok text,
  social_x text,
  social_website text,
  updated_at timestamptz not null default now(),
  constraint brand_settings_single_row check (id = 1)
);

-- Seed the single row so reads never need a null check.
insert into public.brand_settings (id) values (1) on conflict do nothing;

-- Keep updated_at fresh on every change.
create trigger brand_settings_set_updated_at
  before update on public.brand_settings
  for each row execute function public.set_updated_at();

-- RLS: world-readable (brand info is public-facing); admin-only writes.
alter table public.brand_settings enable row level security;

drop policy if exists "brand_settings_public_read" on public.brand_settings;
create policy "brand_settings_public_read"
  on public.brand_settings for select
  using (true);

drop policy if exists "brand_settings_admin_write" on public.brand_settings;
create policy "brand_settings_admin_write"
  on public.brand_settings for all
  using (public.is_admin())
  with check (public.is_admin());
