-- Create a table for public user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('super_admin', 'client')) default 'client',
  subscription_status text check (subscription_status in ('active', 'inactive', 'trial')) default 'trial',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Create a table for sites
create table sites (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  subdomain text unique not null,
  content jsonb default '{}'::jsonb, -- Stores the entire site data structure
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table sites enable row level security;

-- Create policies for sites
create policy "Sites are viewable by everyone (publicly)" on sites for select using ( true );
create policy "Users can insert their own sites." on sites for insert with check ( auth.uid() = owner_id );
create policy "Users can update own sites." on sites for update using ( auth.uid() = owner_id );
create policy "Users can delete own sites." on sites for delete using ( auth.uid() = owner_id );

-- Create a trigger to update 'updated_at' column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_sites_updated_at before update on sites for each row execute procedure update_updated_at_column();

-- Determine trigger to create profile on signup
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
