-- 017_creator_intro_video.sql
-- Adds an optional "Meet the Creator" intro video URL to creators.
-- Additive + idempotent. Non-destructive: no data loss, no column drops.

alter table public.creators
  add column if not exists intro_video_url text;

comment on column public.creators.intro_video_url is
  'Optional YouTube/Vimeo/video URL for the "Meet the Creator" section on the public profile.';
