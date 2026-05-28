-- 002_content_items.sql
-- Polymorphic content table for courses + guides

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('course','guide')),
  slug text not null,
  title text not null,
  tagline text,
  description text,
  cover_url text,
  cover_style text default 'hero' check (cover_style in ('hero','header')),
  audience text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published')),
  is_premium boolean not null default true,
  body jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);

create index content_items_type_status_idx on public.content_items(type, status);
create index content_items_published_idx on public.content_items(published_at desc) where status = 'published';

create trigger content_items_set_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();
