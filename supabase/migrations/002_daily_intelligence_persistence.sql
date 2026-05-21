-- IXAI Daily Intelligence persistence draft.
-- This migration is intentionally not wired into runtime code yet.
-- Goal: replace localStorage / in-memory editorial repository with durable
-- Supabase state before PWA offline caching or production editorial use.

create table if not exists public.ixai_daily_intelligence_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  status text not null check (status in ('draft', 'review', 'published')),
  title text not null,
  market_summary text not null,
  editorial_note text,
  sections jsonb not null default '[]'::jsonb,
  risk_focus jsonb not null default '[]'::jsonb,
  watchlist_notes jsonb not null default '[]'::jsonb,
  intelligence jsonb,
  source_mode text check (source_mode in ('real', 'fallback')),
  provider_mode text check (provider_mode in ('openai', 'fallback', 'error_fallback')),
  input_news_count integer default 0,
  source_status jsonb not null default '[]'::jsonb,
  generated_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ixai_daily_intelligence_drafts_status_idx
  on public.ixai_daily_intelligence_drafts (status);

create index if not exists ixai_daily_intelligence_drafts_published_at_idx
  on public.ixai_daily_intelligence_drafts (published_at desc nulls last);

create unique index if not exists ixai_daily_intelligence_drafts_published_slug_idx
  on public.ixai_daily_intelligence_drafts (slug)
  where status = 'published';

alter table public.ixai_daily_intelligence_drafts enable row level security;

-- Public read policy for published Daily Briefs.
create policy "published daily intelligence is readable"
  on public.ixai_daily_intelligence_drafts
  for select
  using (status = 'published');

-- Admin write policy placeholder.
-- Replace this with Supabase Auth role claims before production:
-- using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ixai_admin')
-- with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ixai_admin')
