-- 005_rls_policies.sql
-- Enable RLS and define all access policies

-- ============================================================
-- Helper functions
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_premium_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role = 'admin' or subscription_status = 'active')
  );
$$;

-- Can the current user see a given content_item?
-- Mirrors the SELECT policy below; used by lesson/resource/playbook policies.
create or replace function public.can_view_content_item(item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.content_items ci
    where ci.id = item_id
      and (
        public.is_admin()
        or (ci.status = 'published' and (ci.is_premium = false or public.has_premium_access()))
      )
  );
$$;

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
-- ^ users may update their own profile but cannot escalate role

create policy "profiles_admin_update_all"
  on public.profiles for update
  using (public.is_admin());

-- profiles insert/delete are handled by the trigger on auth.users; no policy needed
-- (service role bypasses RLS for the trigger and for webhook updates)

-- ============================================================
-- content_items
-- ============================================================
alter table public.content_items enable row level security;

create policy "content_items_select"
  on public.content_items for select
  using (
    public.is_admin()
    or (status = 'published' and (is_premium = false or public.has_premium_access()))
  );

create policy "content_items_admin_write"
  on public.content_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- lessons
-- ============================================================
alter table public.lessons enable row level security;

create policy "lessons_select"
  on public.lessons for select
  using (public.can_view_content_item(course_id));

create policy "lessons_admin_write"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- resources
-- ============================================================
alter table public.resources enable row level security;

create policy "resources_select"
  on public.resources for select
  using (
    case owner_type
      when 'content_item' then public.can_view_content_item(owner_id)
      when 'lesson' then exists (
        select 1 from public.lessons l
        where l.id = owner_id and public.can_view_content_item(l.course_id)
      )
      else false
    end
  );

create policy "resources_admin_write"
  on public.resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- playbooks
-- access derived from access to the source content
-- ============================================================
alter table public.playbooks enable row level security;

create policy "playbooks_select"
  on public.playbooks for select
  using (
    case source_type
      when 'course' then source_id is not null and public.can_view_content_item(source_id)
      when 'video' then source_id is not null and exists (
        select 1 from public.lessons l
        where l.id = source_id and public.can_view_content_item(l.course_id)
      )
      when 'manual' then public.is_admin()
      else false
    end
  );

create policy "playbooks_admin_write"
  on public.playbooks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- progress
-- ============================================================
alter table public.progress enable row level security;

create policy "progress_select_own_or_admin"
  on public.progress for select
  using (user_id = auth.uid() or public.is_admin());

create policy "progress_insert_own"
  on public.progress for insert
  with check (user_id = auth.uid());

create policy "progress_delete_own"
  on public.progress for delete
  using (user_id = auth.uid());
