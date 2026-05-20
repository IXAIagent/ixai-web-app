-- IXAI Web App v1.9.1
-- Lightweight identity persistence for personal watchlists, memory, and preferences.
-- Run this in the Supabase SQL editor or through Supabase migrations.

create extension if not exists pgcrypto;

create table if not exists public.ixai_watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  name text not null,
  asset_type text not null check (asset_type in ('stock', 'crypto', 'index', 'etf')),
  market text not null check (market in ('US', 'TW', 'Crypto', 'Global')),
  note text,
  added_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol, market)
);

create table if not exists public.ixai_profile_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  watched_symbols text[] not null default '{}',
  recently_viewed_sections text[] not null default '{}',
  last_visit_at timestamptz not null default now(),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ixai_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_categories text[] not null default '{}',
  free_plan boolean not null default true,
  pro_plan boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ixai_watchlists_user_id_idx
  on public.ixai_watchlists(user_id);

alter table public.ixai_watchlists enable row level security;
alter table public.ixai_profile_memory enable row level security;
alter table public.ixai_user_preferences enable row level security;

drop policy if exists "IXAI watchlists are user scoped" on public.ixai_watchlists;
create policy "IXAI watchlists are user scoped"
  on public.ixai_watchlists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "IXAI profile memory is user scoped" on public.ixai_profile_memory;
create policy "IXAI profile memory is user scoped"
  on public.ixai_profile_memory
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "IXAI preferences are user scoped" on public.ixai_user_preferences;
create policy "IXAI preferences are user scoped"
  on public.ixai_user_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
