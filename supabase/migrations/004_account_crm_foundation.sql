-- IXAI Web App v1.21
-- Account CRM / Lead Funnel foundation for IXAI Public App.
-- Non-destructive: safely extends ixai_user_profiles created in v1.20.

create extension if not exists pgcrypto;

create table if not exists public.ixai_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  phone text,
  source text not null default 'public_app',
  pro_interest boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ixai_user_profiles
  add column if not exists phone text,
  add column if not exists source text not null default 'public_app',
  add column if not exists pro_interest boolean not null default false,
  add column if not exists onboarding_completed boolean not null default false;

alter table public.ixai_user_profiles
  alter column source set default 'public_app',
  alter column pro_interest set default false,
  alter column onboarding_completed set default false,
  alter column created_at set default now(),
  alter column updated_at set default now();

create index if not exists ixai_user_profiles_email_idx
  on public.ixai_user_profiles(email);

create index if not exists ixai_user_profiles_pro_interest_idx
  on public.ixai_user_profiles(pro_interest);

alter table public.ixai_user_profiles enable row level security;

drop policy if exists "IXAI user profiles are user scoped" on public.ixai_user_profiles;
create policy "IXAI user profiles are user scoped"
  on public.ixai_user_profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant select, insert, update on public.ixai_user_profiles to authenticated;

comment on table public.ixai_user_profiles is
  'IXAI Public App account CRM profile data. User-scoped by RLS; service role may be used by future admin tooling.';
