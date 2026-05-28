-- 008_brand_bucket.sql
-- Public bucket for the brand logo (and any future brand assets).
-- Admin-only writes; world-readable.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand',
  'brand',
  true,
  2 * 1024 * 1024,  -- 2 MB cap; logos should be small
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Anyone can read brand assets (it's a public bucket).
drop policy if exists "brand_public_read" on storage.objects;
create policy "brand_public_read"
  on storage.objects for select
  using (bucket_id = 'brand');

-- Only admins can insert / update / delete.
drop policy if exists "brand_admin_write" on storage.objects;
create policy "brand_admin_write"
  on storage.objects for all
  using (bucket_id = 'brand' and public.is_admin())
  with check (bucket_id = 'brand' and public.is_admin());
