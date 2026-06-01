-- 011_bootstrap_matan_admin.sql
-- Extend the owner-admin bootstrap to include matan@digi-tech.co.il alongside
-- office@digi-tech.co.il. Idempotent.

update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where email in ('office@digi-tech.co.il', 'matan@digi-tech.co.il')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := 'subscriber';
begin
  if new.email in ('office@digi-tech.co.il', 'matan@digi-tech.co.il') then
    v_role := 'admin';
  end if;
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', v_role);
  return new;
end;
$$;
