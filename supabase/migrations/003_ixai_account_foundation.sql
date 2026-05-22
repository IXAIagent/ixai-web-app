-- IXAI Web App v1.20
-- Account foundation for Public App identity, future Pro handoff, and user preferences.
-- Safe to run after 001_identity_persistence.sql. This migration does not remove
-- existing watchlist, memory, or preference columns.

create extension if not exists pgcrypto;

create table if not exists public.ixai_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  preferred_language text not null default 'zh-TW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ixai_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_categories text[] not null default '{}',
  free_plan boolean not null default true,
  pro_plan boolean not null default false,
  watchlist_sync_enabled boolean not null default false,
  pro_handoff_enabled boolean not null default false,
  notification_daily_brief boolean not null default false,
  notification_market_risk boolean not null default false,
  notification_fcn_risk boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ixai_user_preferences
  add column if not exists watchlist_sync_enabled boolean not null default false,
  add column if not exists pro_handoff_enabled boolean not null default false,
  add column if not exists notification_daily_brief boolean not null default false,
  add column if not exists notification_market_risk boolean not null default false,
  add column if not exists notification_fcn_risk boolean not null default false;

create index if not exists ixai_user_profiles_email_idx
  on public.ixai_user_profiles(email);

alter table public.ixai_user_profiles enable row level security;
alter table public.ixai_user_preferences enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ixai_user_profiles'
      and policyname = 'IXAI user profiles are user scoped'
  ) then
    create policy "IXAI user profiles are user scoped"
      on public.ixai_user_profiles
      for all
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ixai_user_preferences'
      and policyname = 'IXAI preferences are user scoped'
  ) then
    create policy "IXAI preferences are user scoped"
      on public.ixai_user_preferences
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;
