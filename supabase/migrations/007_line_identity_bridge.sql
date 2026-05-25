-- v1.36.4 — IXAI LINE Identity Bridge.
--
-- Maps a LINE user id (from LINE OA / LIFF / Messaging API) to the IXAI
-- subscriber profile graph. Server-side writes only; no anon reads.
-- Storage shape mirrors ixai_subscriber_profiles so a future LINE
-- push / personalization layer can join on normalized_email.

create table if not exists public.ixai_line_identities (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null unique,
  subscriber_email text,
  normalized_email text,
  display_name text,

  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),

  source text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ixai_line_identities is
  'IXAI LINE identity bridge. Maps LINE user IDs to subscriber profiles. Server-side writes only.';

create unique index if not exists ixai_line_identities_line_user_id_key
  on public.ixai_line_identities (line_user_id);

create index if not exists ixai_line_identities_normalized_email_idx
  on public.ixai_line_identities (normalized_email);

create index if not exists ixai_line_identities_last_seen_at_idx
  on public.ixai_line_identities (last_seen_at desc);

alter table public.ixai_line_identities enable row level security;

-- Intentionally no policies: server-side service-role writes only.
