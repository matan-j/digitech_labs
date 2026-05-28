-- 001_init_profiles.sql
-- Profiles table linked to auth.users + auto-create on signup

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'subscriber' check (role in ('admin','subscriber')),
  subscription_status text not null default 'none' check (subscription_status in ('active','cancelled','past_due','none')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index profiles_stripe_customer_idx on public.profiles(stripe_customer_id);
create index profiles_subscription_status_idx on public.profiles(subscription_status);

-- Auto-create profile when a new auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper used by later tables
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
