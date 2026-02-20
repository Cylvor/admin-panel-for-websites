-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FULL DATABASE RESET & SETUP                               ║
-- ║  Run this in the Supabase SQL Editor to start fresh.       ║
-- ║                                                            ║
-- ║  ⚠️  WARNING: This DROPS all existing tables and data!     ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Step 1: Drop tables (CASCADE removes their triggers too) ─
drop table if exists website_content cascade;
drop table if exists sites cascade;
drop table if exists profiles cascade;

-- ─── Step 2: Drop the auth trigger (auth.users always exists) ─
drop trigger if exists on_auth_user_created on auth.users;

-- ─── Step 3: Drop functions ──────────────────────────────────
drop function if exists update_updated_at_column() cascade;
drop function if exists public.handle_new_user() cascade;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  CREATE TABLES                                              ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── 1. Profiles (1:1 with auth.users) ──────────────────────
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('super_admin', 'client')) default 'client',
  subscription_status text check (subscription_status in ('active', 'inactive', 'trial')) default 'trial',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

-- Users can view their own profile
create policy "Users can view own profile."
  on profiles for select
  using ( auth.uid() = id );

-- Super admins can view all profiles
create policy "Super admins can view all profiles."
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "Users can insert their own profile."
  on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update using ( auth.uid() = id );


-- ─── 2. Sites ───────────────────────────────────────────────
create table sites (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  subdomain text unique not null,
  content jsonb default '{}'::jsonb,
  deploy_webhook_url text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table sites enable row level security;

-- Published sites are public; drafts only visible to owner or super admins
create policy "Public can view published sites, owners see drafts."
  on sites for select
  using (
    is_published = true
    OR auth.uid() = owner_id
    OR exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- Super admins can insert sites for any owner
create policy "Super admins can insert any site."
  on sites for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "Users can insert their own sites."
  on sites for insert with check ( auth.uid() = owner_id );

create policy "Users can update own sites."
  on sites for update using ( auth.uid() = owner_id );

create policy "Super admins can update any site."
  on sites for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

create policy "Users can delete own sites."
  on sites for delete using ( auth.uid() = owner_id );


-- ─── 3. Website Content (per-section editable content) ──────
create table website_content (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references sites(id) on delete cascade not null,
  section_key text not null,
  content jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(site_id, section_key)
);

alter table website_content enable row level security;

-- Clients can read content for sites they own
create policy "Clients can read own site content."
  on website_content for select
  using (
    site_id in (
      select id from sites where owner_id = auth.uid()
    )
  );

-- Clients can update content for sites they own
create policy "Clients can update own site content."
  on website_content for update
  using (
    site_id in (
      select id from sites where owner_id = auth.uid()
    )
  );

-- Super admins have full CRUD on all website content
create policy "Super admins have full access to website_content."
  on website_content for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FUNCTIONS & TRIGGERS                                       ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_sites_updated_at
  before update on sites
  for each row execute procedure update_updated_at_column();

create trigger update_website_content_updated_at
  before update on website_content
  for each row execute procedure update_updated_at_column();

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
