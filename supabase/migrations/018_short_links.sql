-- 018_short_links.sql
-- Minimal link-shortener backing the "share course" feature.
--   short_links: code -> target_path mapping, one stable code per target.
-- Public (anon) read + insert so the share button works on the public /learn
-- pages, mirroring the guide_views public-insert policy from 014.

create table if not exists public.short_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  -- Relative, same-origin path (e.g. '/learn/courses/ai-agents'). We never
  -- store the host so links resolve correctly across dev/staging/prod.
  target_path text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists short_links_code_idx on public.short_links(code);

alter table public.short_links enable row level security;

-- Anyone (including anonymous visitors) may resolve a short link.
drop policy if exists "short_links_select" on public.short_links;
create policy "short_links_select"
  on public.short_links for select
  using (true);

-- Anyone may mint a short link (mirrors guide_views public insert in 014).
drop policy if exists "short_links_insert" on public.short_links;
create policy "short_links_insert"
  on public.short_links for insert
  with check (true);
