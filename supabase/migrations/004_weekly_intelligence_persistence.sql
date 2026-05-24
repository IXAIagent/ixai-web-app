create table if not exists public.ixai_weekly_intelligence_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('draft', 'review', 'published', 'archived')),
  week_start date not null,
  week_end date not null,
  publish_date timestamptz,
  generated_at timestamptz,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  source_mode text default 'ai_assisted',
  summary text,
  sections jsonb not null default '{}'::jsonb,
  ai_suggestion jsonb not null default '{}'::jsonb,
  editorial_notes text,
  compliance_note text,
  created_by text default 'system',
  updated_by text
);

create unique index if not exists ixai_weekly_intelligence_week_range_key
  on public.ixai_weekly_intelligence_drafts (week_start, week_end);

create index if not exists ixai_weekly_intelligence_status_idx
  on public.ixai_weekly_intelligence_drafts (status);

create index if not exists ixai_weekly_intelligence_published_at_idx
  on public.ixai_weekly_intelligence_drafts (published_at desc);

alter table public.ixai_weekly_intelligence_drafts enable row level security;

drop policy if exists "Public can read published weekly intelligence" on public.ixai_weekly_intelligence_drafts;

create policy "Public can read published weekly intelligence"
  on public.ixai_weekly_intelligence_drafts
  for select
  using (status = 'published');
