-- 046_popup_inline_signup_form.sql
-- Adds an inline registration-form option for popup images.
--
-- DESIGN:
--   * `image_signup_form` (boolean): when true, the popup shows the uploaded
--     image on top with the site's registration/login form (AccessForm) docked
--     directly beneath it — like a signup popup with an image header. The
--     visitor can register without clicking anything. The public renderer only
--     renders the form for logged-out visitors (a logged-in user sees the image
--     alone). Mutually exclusive with `image_link_auth` in the admin form.
--
-- No RLS change — additive column only.
--   Run this in the Supabase SQL editor.

alter table public.popups
  add column if not exists image_signup_form boolean not null default false;
