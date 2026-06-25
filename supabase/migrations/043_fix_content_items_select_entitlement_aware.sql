-- 043_fix_content_items_select_entitlement_aware.sql
-- ROOT CAUSE of "assigned/purchased user is bounced off the lesson back to the
-- course landing, while admin works":
--
--   The LIVE content_items SELECT policy was still the LEGACY form (migration
--   005, re-stated by 014):
--     is_admin()
--     OR (status='published' AND (is_premium = false OR has_premium_access()))
--     OR creator_id = my_creator_id()
--   It NEVER consulted entitlements. Migration 022 was supposed to replace it
--   with the entitlement-aware form, but on the live DB that change was not in
--   effect (014's form was what was actually installed).
--
--   Effect: for a purchase_required + is_premium=true course, an ENTITLED but
--   non-premium buyer/assignee could read the lessons rows (lessons_select was
--   fixed via can_view_content_item → has_content_access in migration 032) but
--   NOT the parent content_items COURSE row. getCourseWithModules() reads the
--   course row first and returns null when it's hidden, so getLesson() returned
--   null and the lesson page redirected to /learn/courses/<slug>. Admins passed
--   only via the is_admin() branch — which is exactly why "admin works, the
--   assigned user doesn't".
--
-- THE FIX (re-affirm migration 022's intent):
--   Delegate the published-content visibility decision to has_content_access(id),
--   the single source of truth that already honours open / login_required /
--   purchase_required (entitlement, incl. bundle via 042) / subscription_required
--   (premium OR per-course entitlement, 034), plus admin + owning creator. The
--   explicit is_admin()/creator OR-branches are kept so they can still read DRAFT
--   content. Non-buyers remain blocked on the base table and continue to render
--   the landing from content_items_public — no paywall leak.
--
-- ⚠️ RLS CHANGE — review + apply per the project's RLS approval process (CLAUDE.md).
--   Idempotent (DROP + CREATE). Already applied to the live DB.

drop policy if exists "content_items_select" on public.content_items;
create policy "content_items_select"
  on public.content_items for select
  using (
    public.is_admin()
    or creator_id = public.my_creator_id()
    or (status = 'published' and public.has_content_access(id))
  );
