-- ═══════════════════════════════════════════════
--  SELLR.ai — Production Database Schema
--  Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ───────────────────────────────────
create table if not exists public.profiles (
  id               uuid references auth.users on delete cascade primary key,
  name             text,
  email            text,
  avatar_url       text,
  whop_store_url   text,
  plan             text not null default 'free'
                   check (plan in ('free','starter','pro','scale')),
  credits_used     integer not null default 0,
  credits_limit    integer not null default 50,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ── Chat sessions ───────────────────────────────
create table if not exists public.chat_sessions (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  title      text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "Users can manage own sessions"
  on public.chat_sessions for all using (auth.uid() = user_id);

-- ── Messages ───────────────────────────────────
create table if not exists public.messages (
  id         uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can manage own messages"
  on public.messages for all using (auth.uid() = user_id);

-- ── Feedback ───────────────────────────────────
create table if not exists public.feedback (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  reason     text not null default 'other',
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Users can insert own feedback"
  on public.feedback for insert with check (auth.uid() = user_id);

-- ── Auto-create profile on signup ───────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Updated_at trigger ─────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger sessions_updated_at
  before update on public.chat_sessions
  for each row execute procedure public.set_updated_at();
