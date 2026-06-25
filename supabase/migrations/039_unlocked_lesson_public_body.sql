-- 039_unlocked_lesson_public_body.sql
-- Switch the per-lesson access gate from is_preview to is_locked.
--
-- NEW MODEL (per the admin lock icon, the single per-lesson control):
--   * is_locked = false (UNLOCKED) → the lesson is FREE for everyone, including
--     visitors who have not purchased the course.
--   * is_locked = true  (LOCKED)   → the lesson requires course access
--     (purchase / membership / admin). Buyers see it; non-buyers do not.
--   The old is_preview opt-in (migration 038) is retired — the column stays but
--   is no longer consulted.
--
-- This recreates lessons_public so the body/vimeo of an UNLOCKED lesson is
-- exposed to non-buyers (masked to NULL for locked lessons, so paid content
-- never leaks). The hierarchical module/chapter lock is still enforced in the
-- app (a lesson under a locked module/chapter is treated as locked).
--
-- ⚠️ RLS / access-exposure CHANGE — review + apply per the project's RLS
--   approval process (CLAUDE.md). Safe to apply after 031 (lessons_public +
--   lessons.is_locked) and 018 (lessons.body / vimeo_id). Supersedes 038.

drop view if exists public.lessons_public;
create view public.lessons_public
with (security_invoker = false) as
  select
    l.id, l.course_id, l.module_id, l.chapter_id, l.num, l.slug,
    l.title, l.duration, l.position, l.is_preview, l.is_locked,
    -- Content is exposed ONLY for an UNLOCKED lesson. Locked lessons stay NULL
    -- here and remain reachable only through the gated base table (buyers).
    case when not l.is_locked then l.body end as body,
    case when not l.is_locked then l.vimeo_id end as vimeo_id
  from public.lessons l
  join public.content_items ci on ci.id = l.course_id
  where ci.status = 'published';

grant select on public.lessons_public to anon, authenticated;
