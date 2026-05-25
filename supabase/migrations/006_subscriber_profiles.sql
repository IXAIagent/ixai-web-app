-- v1.36.2 — IXAI Subscriber Profile aggregation layer.
--
-- Sits one level above ixai_distribution_subscribers (raw email capture) and
-- exposes a per-subscriber engagement graph: read counts per surface, share
-- counts, average read depth, favorite surface, engagement + Pro-candidate
-- scores, attribution carry-over and editorial tags. Server-side writes only;
-- no anon reads.

create table if not exists public.ixai_subscriber_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  normalized_email text unique,
  subscriber_status text not null default 'active'
    check (subscriber_status in ('active', 'unsubscribed', 'bounced', 'complained')),

  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),

  total_reads integer not null default 0,
  weekly_reads integer not null default 0,
  daily_reads integer not null default 0,
  market_reads integer not null default 0,
  fcn_reads integer not null default 0,

  total_shares integer not null default 0,

  avg_read_depth numeric not null default 0,

  favorite_surface text,

  engagement_score numeric not null default 0,
  pro_candidate_score numeric not null default 0,

  utm_source text,
  utm_medium text,
  utm_campaign text,

  tags jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ixai_subscriber_profiles is
  'IXAI subscriber engagement profile. Server-side aggregation only.';

create unique index if not exists ixai_subscriber_profiles_normalized_email_key
  on public.ixai_subscriber_profiles (normalized_email);

create index if not exists ixai_subscriber_profiles_engagement_idx
  on public.ixai_subscriber_profiles (engagement_score desc);

create index if not exists ixai_subscriber_profiles_last_seen_idx
  on public.ixai_subscriber_profiles (last_seen_at desc);

create index if not exists ixai_subscriber_profiles_status_idx
  on public.ixai_subscriber_profiles (subscriber_status);

create index if not exists ixai_subscriber_profiles_favorite_surface_idx
  on public.ixai_subscriber_profiles (favorite_surface);

alter table public.ixai_subscriber_profiles enable row level security;

-- Intentionally no policies: server-side service-role writes only. Anon and
-- authenticated browser sessions cannot see subscriber rows. Aggregation is
-- exposed exclusively through admin API endpoints under /api/admin.
