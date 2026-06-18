-- 013_video_taxonomy.sql
-- YouTube video field + domain/category taxonomy for guides and playbooks.

-- ============================================================
-- 1. content_items: add video_url + domain
-- ============================================================

alter table public.content_items
  add column if not exists video_url text,
  add column if not exists domain text;

alter table public.content_items
  drop constraint if exists content_items_domain_check;

alter table public.content_items
  add constraint content_items_domain_check
  check (domain is null or domain in ('marketing','ai','sales','design','business','tech'));

create index if not exists content_items_domain_idx
  on public.content_items(domain)
  where domain is not null;

-- ============================================================
-- 2. playbooks: upgrade to full-featured editable rows
-- ============================================================

alter table public.playbooks
  add column if not exists slug text,
  add column if not exists tagline text,
  add column if not exists description text,
  add column if not exists cover_url text,
  add column if not exists cover_style text default 'hero',
  add column if not exists video_url text,
  add column if not exists domain text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status text not null default 'draft',
  add column if not exists is_premium boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.playbooks
  drop constraint if exists playbooks_status_check;
alter table public.playbooks
  add constraint playbooks_status_check
  check (status in ('draft','published'));

alter table public.playbooks
  drop constraint if exists playbooks_domain_check;
alter table public.playbooks
  add constraint playbooks_domain_check
  check (domain is null or domain in ('marketing','ai','sales','design','business','tech'));

alter table public.playbooks
  drop constraint if exists playbooks_cover_style_check;
alter table public.playbooks
  add constraint playbooks_cover_style_check
  check (cover_style is null or cover_style in ('hero','header'));

-- Backfill slugs for existing rows so the unique index can be created.
update public.playbooks
set slug = coalesce(
  slug,
  regexp_replace(
    regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'),
    '(^-+)|(-+$)', '', 'g'
  ) || '-' || substr(id::text, 1, 8)
)
where slug is null;

create unique index if not exists playbooks_slug_unique on public.playbooks(slug);
create index if not exists playbooks_status_domain_idx on public.playbooks(status, domain);
create index if not exists playbooks_published_idx on public.playbooks(published_at desc) where status = 'published';

-- updated_at trigger
drop trigger if exists playbooks_set_updated_at on public.playbooks;
create trigger playbooks_set_updated_at
  before update on public.playbooks
  for each row execute function public.set_updated_at();

-- Refresh playbooks_select policy to surface published manual playbooks to anyone
-- (subject to is_premium / has_premium_access) while keeping source-derived gates intact.
drop policy if exists "playbooks_select" on public.playbooks;
create policy "playbooks_select"
  on public.playbooks for select
  using (
    public.is_admin()
    or (
      status = 'published'
      and (is_premium = false or public.has_premium_access())
      and (
        source_type = 'manual'
        or (source_type = 'course' and source_id is not null and public.can_view_content_item(source_id))
        or (source_type = 'video' and source_id is not null and exists (
          select 1 from public.lessons l
          where l.id = source_id and public.can_view_content_item(l.course_id)
        ))
      )
    )
  );

-- ============================================================
-- 3. categories table (admin-managed, public-readable)
-- ============================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  domain text not null check (domain in ('marketing','ai','sales','design','business','tech')),
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_domain_sort_idx on public.categories(domain, sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories for select
  using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 4. Junction tables
-- ============================================================

create table if not exists public.content_item_categories (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (content_item_id, category_id)
);

create index if not exists cic_category_idx on public.content_item_categories(category_id);

alter table public.content_item_categories enable row level security;

drop policy if exists "cic_select" on public.content_item_categories;
create policy "cic_select"
  on public.content_item_categories for select
  using (public.can_view_content_item(content_item_id));

drop policy if exists "cic_admin_write" on public.content_item_categories;
create policy "cic_admin_write"
  on public.content_item_categories for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.playbook_categories (
  playbook_id uuid not null references public.playbooks(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (playbook_id, category_id)
);

create index if not exists pc_category_idx on public.playbook_categories(category_id);

alter table public.playbook_categories enable row level security;

drop policy if exists "pc_select" on public.playbook_categories;
create policy "pc_select"
  on public.playbook_categories for select
  using (
    exists (
      select 1 from public.playbooks p
      where p.id = playbook_id
        and (
          public.is_admin()
          or (
            p.status = 'published'
            and (p.is_premium = false or public.has_premium_access())
          )
        )
    )
  );

drop policy if exists "pc_admin_write" on public.playbook_categories;
create policy "pc_admin_write"
  on public.playbook_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 5. Seed initial categories (admin can edit/extend later)
-- ============================================================

insert into public.categories (slug, name, domain, sort_order) values
  ('email',         'אימייל',           'marketing',  10),
  ('funnels',       'פאנלים',          'marketing',  20),
  ('organic',       'אורגני',           'marketing',  30),
  ('ads',           'מודעות ממומנות',  'marketing',  40),
  ('seo',           'SEO',              'marketing',  50),

  ('automation',    'אוטומציה',         'ai',         10),
  ('agents',        'סוכנים',           'ai',         20),
  ('prompting',     'פרומפטינג',        'ai',         30),
  ('llms',          'מודלי שפה',        'ai',         40),

  ('outreach',      'מכירות קרות',      'sales',      10),
  ('closing',       'סגירת עסקאות',     'sales',      20),
  ('crm',           'CRM וניהול לידים', 'sales',      30),

  ('branding',      'מיתוג',            'design',     10),
  ('ui-ux',         'UI / UX',          'design',     20),
  ('social-visual', 'ויזואל לרשתות',    'design',     30),

  ('strategy',      'אסטרטגיה',         'business',   10),
  ('finance',       'פיננסים',          'business',   20),
  ('operations',    'תפעול',            'business',   30),

  ('webdev',        'פיתוח אתרים',      'tech',       10),
  ('nocode',        'No-Code',          'tech',       20),
  ('data',          'דאטה ואנליטיקס',   'tech',       30)
on conflict (slug) do nothing;
