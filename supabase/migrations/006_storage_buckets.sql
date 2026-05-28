-- 006_storage_buckets.sql
-- Create storage buckets and bucket-level RLS policies

-- covers/ — public bucket for course/guide cover images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers', 'covers', true, 5242880,  -- 5 MB
  array['image/png','image/jpeg','image/webp','image/svg+xml']
)
on conflict (id) do nothing;

-- resources/ — private bucket for PDFs/XLSX/DOCX (served via signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources', 'resources', false, 52428800,  -- 50 MB
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- Storage policies
-- ============================================================

-- covers: public read (bucket public=true already handles this for SELECT);
-- only admins can write.
create policy "covers_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and public.is_admin());

create policy "covers_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'covers' and public.is_admin());

create policy "covers_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and public.is_admin());

-- resources: only admins can write. Read is via signed URLs created server-side
-- using the service role, so no SELECT policy is needed for anon/authenticated.
create policy "resources_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());

create policy "resources_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'resources' and public.is_admin());

create policy "resources_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());
