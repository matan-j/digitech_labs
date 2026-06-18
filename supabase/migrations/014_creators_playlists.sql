-- 014_creators_playlists.sql
-- Creator-driven Learning Hub (Phase 1):
--   creators, playlists, playlist_items, guide_views
--   + content_items extensions (creator_id, content_kind, content_url, duration, featured, seo, updated_by)
--   + 'creator' role + RLS scoped to creators.user_id = auth.uid()

-- ============================================================
-- 0. profiles: allow the 'creator' role
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin','subscriber','creator'));

-- ============================================================
-- 1. creators
-- ============================================================

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  avatar_url text,
  banner_url text,
  bio text,
  role_title text,
  website text,
  linkedin text,
  instagram text,
  youtube text,
  tiktok text,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active','disabled')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One creator per platform user (multiple NULLs allowed).
create unique index if not exists creators_user_id_unique
  on public.creators(user_id) where user_id is not null;
create index if not exists creators_featured_idx
  on public.creators(sort_order, created_at desc) where is_featured;

drop trigger if exists creators_set_updated_at on public.creators;
create trigger creators_set_updated_at
  before update on public.creators
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. playlists
-- ============================================================

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  thumbnail_url text,
  domain text check (domain is null or domain in ('marketing','ai','sales','design','business','tech')),
  status text not null default 'draft' check (status in ('draft','published')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  og_image_url text,
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, slug)
);

create index if not exists playlists_creator_idx on public.playlists(creator_id);
create index if not exists playlists_featured_idx
  on public.playlists(sort_order, created_at desc) where is_featured;
create index if not exists playlists_status_idx on public.playlists(status);

drop trigger if exists playlists_set_updated_at on public.playlists;
create trigger playlists_set_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. playlist_items (ordered)
-- ============================================================

create table if not exists public.playlist_items (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  primary key (playlist_id, content_item_id)
);

create index if not exists playlist_items_item_idx on public.playlist_items(content_item_id);
create index if not exists playlist_items_order_idx on public.playlist_items(playlist_id, sort_order);

-- ============================================================
-- 4. guide_views (statistics)
-- ============================================================

create table if not exists public.guide_views (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists guide_views_item_idx on public.guide_views(content_item_id);

-- ============================================================
-- 5. content_items extensions (guides become creator-owned, typed)
-- ============================================================

alter table public.content_items
  add column if not exists creator_id uuid references public.creators(id) on delete set null,
  add column if not exists content_kind text,
  add column if not exists content_url text,
  add column if not exists duration_minutes int,
  add column if not exists is_featured boolean not null default false,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_image_url text,
  add column if not exists updated_by uuid references public.profiles(id);

alter table public.content_items
  drop constraint if exists content_items_content_kind_check;
alter table public.content_items
  add constraint content_items_content_kind_check
  check (content_kind is null or content_kind in ('youtube','vimeo','pdf','link','article'));

create index if not exists content_items_creator_idx
  on public.content_items(creator_id) where creator_id is not null;
create index if not exists content_items_featured_idx
  on public.content_items(created_at desc) where is_featured;

-- ============================================================
-- 6. RLS helper — current user's creator id
-- ============================================================

create or replace function public.my_creator_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.creators
  where user_id = auth.uid()
  limit 1;
$$;

-- Aggregate-only view counters (SECURITY DEFINER) so public creator pages can
-- show totals without exposing individual guide_views rows.
create or replace function public.creator_total_views(p_creator_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.guide_views gv
  join public.content_items ci on ci.id = gv.content_item_id
  where ci.creator_id = p_creator_id;
$$;

-- ============================================================
-- 7. RLS — creators
-- ============================================================

alter table public.creators enable row level security;

drop policy if exists "creators_select" on public.creators;
create policy "creators_select"
  on public.creators for select
  using (status = 'active' or public.is_admin() or user_id = auth.uid());

drop policy if exists "creators_admin_write" on public.creators;
create policy "creators_admin_write"
  on public.creators for all
  using (public.is_admin())
  with check (public.is_admin());

-- A creator may UPDATE only their own row. Column-level locking
-- (status/user_id/is_featured/sort_order) is enforced at the API layer.
drop policy if exists "creators_update_own" on public.creators;
create policy "creators_update_own"
  on public.creators for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 8. RLS — playlists
-- ============================================================

alter table public.playlists enable row level security;

drop policy if exists "playlists_select" on public.playlists;
create policy "playlists_select"
  on public.playlists for select
  using (
    status = 'published'
    or public.is_admin()
    or creator_id = public.my_creator_id()
  );

drop policy if exists "playlists_admin_write" on public.playlists;
create policy "playlists_admin_write"
  on public.playlists for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "playlists_creator_write" on public.playlists;
create policy "playlists_creator_write"
  on public.playlists for all
  using (creator_id = public.my_creator_id())
  with check (creator_id = public.my_creator_id());

-- ============================================================
-- 9. RLS — playlist_items
-- ============================================================

alter table public.playlist_items enable row level security;

drop policy if exists "playlist_items_select" on public.playlist_items;
create policy "playlist_items_select"
  on public.playlist_items for select
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id
        and (p.status = 'published' or public.is_admin() or p.creator_id = public.my_creator_id())
    )
  );

drop policy if exists "playlist_items_admin_write" on public.playlist_items;
create policy "playlist_items_admin_write"
  on public.playlist_items for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "playlist_items_creator_write" on public.playlist_items;
create policy "playlist_items_creator_write"
  on public.playlist_items for all
  using (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.creator_id = public.my_creator_id())
  )
  with check (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.creator_id = public.my_creator_id())
  );

-- ============================================================
-- 10. RLS — content_items: let creators see + manage their own
-- ============================================================

-- Extend SELECT so creators (and admins) can see their own drafts.
drop policy if exists "content_items_select" on public.content_items;
create policy "content_items_select"
  on public.content_items for select
  using (
    public.is_admin()
    or (status = 'published' and (is_premium = false or public.has_premium_access()))
    or creator_id = public.my_creator_id()
  );

-- Creators may write only their own content (creator_id = their creator id).
drop policy if exists "content_items_creator_write" on public.content_items;
create policy "content_items_creator_write"
  on public.content_items for all
  using (creator_id = public.my_creator_id())
  with check (creator_id = public.my_creator_id());

-- content_items_admin_write from 005 stays in place.

-- ============================================================
-- 11. RLS — guide_views
-- ============================================================

alter table public.guide_views enable row level security;

drop policy if exists "guide_views_insert" on public.guide_views;
create policy "guide_views_insert"
  on public.guide_views for insert
  with check (true);

drop policy if exists "guide_views_select" on public.guide_views;
create policy "guide_views_select"
  on public.guide_views for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.content_items ci
      where ci.id = content_item_id and ci.creator_id = public.my_creator_id()
    )
  );
