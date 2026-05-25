create table if not exists public.ixai_distribution_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text not null unique,
  status text not null default 'active'
    check (status in ('active', 'unsubscribed', 'bounced', 'complained')),
  source_surface text,
  source_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_subscribed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

comment on table public.ixai_distribution_subscribers is
  'IXAI distribution subscriber capture table. Server-side writes only.';

create unique index if not exists ixai_distribution_subscribers_normalized_email_key
  on public.ixai_distribution_subscribers (normalized_email);

create index if not exists ixai_distribution_subscribers_status_idx
  on public.ixai_distribution_subscribers (status);

create index if not exists ixai_distribution_subscribers_created_at_idx
  on public.ixai_distribution_subscribers (created_at desc);

create index if not exists ixai_distribution_subscribers_source_surface_idx
  on public.ixai_distribution_subscribers (source_surface);

create index if not exists ixai_distribution_subscribers_utm_source_idx
  on public.ixai_distribution_subscribers (utm_source);

alter table public.ixai_distribution_subscribers enable row level security;
