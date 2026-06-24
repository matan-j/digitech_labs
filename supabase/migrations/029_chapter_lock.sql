-- 028_chapter_lock.sql
-- Per-chapter HARD lock.
--   is_locked = true  → the chapter (and every lesson in it) is blocked for
--                       EVERYONE: guests, purchasers, admin-granted/assigned
--                       users, subscribers and admins alike. Overrides
--                       entitlements AND free-preview lessons.
--   is_locked = false → normal course-level access rules apply (a learner with
--                       access to the course can use the chapter).
--
-- Additive + idempotent. Safe to re-run.

alter table public.chapters
  add column if not exists is_locked boolean not null default false;

-- Re-affirm chapters_public (migration 026) with the new is_locked column so a
-- guest/public read of a published course can also see the lock state.
-- DROP+CREATE (not REPLACE) to be robust against an older column order living
-- in the DB. No other view depends on chapters_public.
drop view if exists public.chapters_public;
create view public.chapters_public
with (security_invoker = false) as
  select
    c.id, c.module_id, c.num, c.slug, c.title, c.duration,
    c.position, c.created_at, c.is_locked
  from public.chapters c
  join public.modules m on m.id = c.module_id
  join public.content_items ci on ci.id = m.course_id
  where ci.status = 'published';

grant select on public.chapters_public to anon, authenticated;
