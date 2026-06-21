# Phase 0 — Schema & Access Audit (Public-First Hub)

Internal baseline for the public-first / progressive-access / GROW build. Read-only audit; no schema applied.

## 1. Current table map

| Table | Public-safe metadata | Protected body (currently co-located) |
|---|---|---|
| `content_items` (course/guide) | type, slug, title, tagline, description, cover_url, cover_style, audience, tags, domain, duration_minutes, creator_id, content_kind, is_featured, seo_title, seo_description, og_image_url, status, published_at | **`body` jsonb**, **`video_url`** (013), **`content_url`** |
| `lessons` | course_id, module_id, chapter_id, num, slug, title, duration, position | **`body` text**, **`vimeo_id`** |
| `playbooks` | title, source_type, source_id, audience, (013: slug, tagline, cover_url, domain, tags, status) | **`html_content`** |
| `resources` | owner_type, owner_id, title, size_mb, kind | **`url`** — already isolated in its own gated table |
| `creators` | all columns public-safe (status-gated) | — |
| `playlists` / `playlist_items` | all public-safe | — |
| `guide_views` | aggregate via `creator_total_views()` SECURITY DEFINER | individual rows admin/creator-only |
| `profiles` | — | private; RLS own-or-admin |

## 2. Metadata / body separation map

- **Split required** (parent row mixes public metadata + protected body):
  - `content_items.body`, `video_url`, `content_url` → `content_bodies(content_item_id PK/FK, body jsonb, video_url text, content_url text)`
  - `lessons.body`, `vimeo_id` → `lesson_bodies(lesson_id PK/FK, body text, vimeo_id text)`
  - `playbooks.html_content` → `playbook_bodies(playbook_id PK/FK, html_content text)`
- **No split needed**: `resources` (already separate; tighten RLS to entitlement-aware).
- `access_level='open'` → body remains publicly readable. `login_required|purchase_required|subscription_required` → only metadata public; body table gated by `has_access()`.

## 3. Current access/premium checks

- RLS `005` + `014`: `content_items_select` returns the **whole row** when `is_admin() OR (status='published' AND (is_premium=false OR has_premium_access())) OR creator_id=my_creator_id()`. Premium rows are fully hidden from anon today → no public metadata possible until the split + visibility rewrite (migration 022).
- `lessons`/`resources`/`playbooks` inherit access via `can_view_content_item()`.
- App-layer gates: `app/learn/guides/[slug]`, `app/learn/courses/[course]`, `app/learn/playbooks/[id]` server-redirect premium → `/login` → `/upgrade`. `middleware.ts` gates only `/admin`, `/learn-admin`, `/account`, `/upgrade/success`.

## 4. Legacy Stripe access path (keep intact)

`hasPremiumAccess(profile)` = `role==='admin' || subscription_status==='active'` (`lib/auth.ts`), synced by `app/api/stripe/webhook`. New `canAccess()` ORs this with `enrollments` (free) and `entitlements` (paid). No Stripe file is modified.

## 5. Safe migration approach (additive, non-destructive)

1. Create `*_bodies` child tables.
2. Backfill from existing columns (`insert … select`).
3. **Keep** legacy `body`/`video_url`/`vimeo_id`/`html_content` columns; dual-read during transition.
4. Reconciliation script: counts of `content_items` vs `content_bodies`, missing body/video/resource rows.
5. No drops / no destructive moves until live verification is approved.

## 6. Planned migration order (files only — not applied)

```
018_content_access_model.sql       publication_status(+archived), catalog_visibility, access_level, preview_enabled, price_*, lessons.is_preview, *_bodies tables, backfill
019_enrollments_entitlements.sql   enrollments, entitlements, has_access() helper
020_grow_orders_payments.sql       orders, payment_events
021_lead_attribution_analytics.sql profiles attribution/consent cols, analytics_events
022_rls_visibility.sql             metadata-public + body-protected + entitlement/enrollment-aware policies
```

No bundles/subscriptions tables in V1 (generic `resource_type`/`content_type` keep them future-ready).

## 7. Git baseline

Migrations 013–017 already committed (`c7673cd`, `6dfc358`). Uncommitted tree items (`.claude/scheduled_tasks.lock`, `.agents/`, `skills-lock.json`) are unrelated pre-existing work — excluded from all phase commits.

## 8. Auth methods (configured-only)

Google Sign-In + Magic Link fallback. No password, no email-code unless verified present in Supabase config.
