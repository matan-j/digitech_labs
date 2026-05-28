-- 004_playbooks_progress.sql
-- Generated playbooks + server-side progress tracking

create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('course','video','manual')),
  source_id uuid,
  title text not null,
  html_content text not null,
  audience text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index playbooks_source_idx on public.playbooks(source_type, source_id);

create table public.progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index progress_user_idx on public.progress(user_id);
