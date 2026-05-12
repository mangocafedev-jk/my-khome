-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (mirrors auth.users with role)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('user', 'agent')) default 'user',
  name text not null default '',
  created_at timestamptz default now()
);

-- Agents table
create table if not exists public.agents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  company text not null default '',
  phone text not null default '',
  district text not null default ''
);

-- Listings table
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.agents(id) on delete cascade not null,
  title_kr text not null,
  title_en text not null default '',
  type text not null check (type in ('월세', '전세', '매매')),
  price integer not null default 0,
  deposit integer not null default 0,
  size numeric(6,2) not null default 0,
  district text not null,
  subway_station text not null default '',
  subway_minutes integer not null default 0,
  contract text not null check (contract in ('단기', '장기')) default '장기',
  duration integer not null default 12,
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_at timestamptz default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  sender_name text not null,
  sender_contact text not null,
  content_en text not null,
  content_kr text not null default '',
  reply_kr text,
  reply_en text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.users enable row level security;
alter table public.agents enable row level security;
alter table public.listings enable row level security;
alter table public.messages enable row level security;

-- Users: anyone can read their own row; service role manages inserts
create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Agents: readable by all authenticated users
create policy "Agents readable by all" on public.agents
  for select using (true);

create policy "Agents editable by owner" on public.agents
  for all using (user_id = auth.uid());

-- Listings: active ones readable by everyone, agents manage their own
create policy "Active listings readable by all" on public.listings
  for select using (status = 'active' or agent_id in (
    select id from public.agents where user_id = auth.uid()
  ));

create policy "Agents manage own listings" on public.listings
  for all using (agent_id in (
    select id from public.agents where user_id = auth.uid()
  ));

-- Messages: agents see messages for their listings; anyone can insert
create policy "Anyone can send messages" on public.messages
  for insert with check (true);

create policy "Agents read messages for own listings" on public.messages
  for select using (listing_id in (
    select l.id from public.listings l
    join public.agents a on l.agent_id = a.id
    where a.user_id = auth.uid()
  ));

create policy "Agents update messages for own listings" on public.messages
  for update using (listing_id in (
    select l.id from public.listings l
    join public.agents a on l.agent_id = a.id
    where a.user_id = auth.uid()
  ));

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, role, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
