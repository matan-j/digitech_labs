-- 016_creator_emails.sql
-- Public + contact email for creators (identity + future business use).

alter table public.creators
  add column if not exists email text,
  add column if not exists contact_email text;
