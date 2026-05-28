-- 007_stripe_events.sql
-- Track Stripe webhook events to prevent double-processing on retries

create table public.stripe_events (
  id text primary key,            -- Stripe event id (evt_...)
  type text not null,             -- event type (customer.subscription.updated, etc.)
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- No policies — only service role writes here, and only admins should read.
create policy "stripe_events_admin_read"
  on public.stripe_events for select
  using (public.is_admin());
