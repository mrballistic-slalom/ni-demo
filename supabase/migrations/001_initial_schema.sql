-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  beats_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PROJECTS (beats)
-- ============================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'Untitled Beat' not null,
  genre text not null check (genre in ('trap', 'lofi', 'house', 'drill', 'hyperpop')),
  bpm integer default 120 not null check (bpm between 60 and 200),
  pattern_length integer default 1 not null check (pattern_length in (1, 2, 4)),
  swing integer default 0 not null check (swing between 0 and 100),
  grid jsonb not null,           -- GridState: {"kick": [1,0,0,...], ...}
  sounds jsonb not null,         -- SoundSelections: {"kick": "trap_kick_01", ...}
  volumes jsonb not null,        -- TrackVolumes: {"kick": 0.8, ...}
  mutes jsonb default '{"kick":false,"snare":false,"hihat":false,"melody":false,"bass":false,"fx":false}'::jsonb not null,
  share_id text unique,          -- short alphanumeric for public share links
  modifications_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast user project listing
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_share_id on public.projects(share_id) where share_id is not null;

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at();

-- Auto-increment beats_count on profile when new project saved
create or replace function public.increment_beats_count()
returns trigger as $$
begin
  update public.profiles
  set beats_count = beats_count + 1, updated_at = now()
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.increment_beats_count();

-- Decrement on delete
create or replace function public.decrement_beats_count()
returns trigger as $$
begin
  update public.profiles
  set beats_count = greatest(0, beats_count - 1), updated_at = now()
  where id = old.user_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_project_deleted
  after delete on public.projects
  for each row execute procedure public.decrement_beats_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Projects: users CRUD own projects
create policy "Users can view own projects"
  on public.projects for select using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Shared beats: anyone can read a project by share_id (via API route, not direct RLS)
-- We handle this in the API route by querying without auth context
create policy "Anyone can view shared projects"
  on public.projects for select using (share_id is not null);
