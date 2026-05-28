-- 003_lessons_resources.sql
-- Lessons (course children) + resources attached to either lessons or content_items

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.content_items(id) on delete cascade,
  num int not null,
  slug text not null,
  title text not null,
  vimeo_id text,
  duration text,
  body text,
  position int not null,
  unique (course_id, slug)
);

create index lessons_course_position_idx on public.lessons(course_id, position);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('lesson','content_item')),
  owner_id uuid not null,
  title text not null,
  url text not null,
  size_mb numeric,
  kind text check (kind in ('pdf','xlsx','docx','link')),
  created_at timestamptz not null default now()
);

create index resources_owner_idx on public.resources(owner_type, owner_id);
