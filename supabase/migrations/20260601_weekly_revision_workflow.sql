-- IXAI v1.43.1 — Weekly Revision Workflow
--
-- DO NOT APPLY WITHOUT BACKUP / REVIEW.
-- This migration changes the Weekly Intelligence uniqueness model from
-- "one row per week" to "one canonical published row per week, plus
-- optional revision drafts/reviews".
--
-- Required manual preflight before production:
-- 1. Back up public.ixai_weekly_intelligence_drafts.
-- 2. Confirm no duplicate (week_start, week_end, revision_number) rows.
-- 3. Confirm public routes have deployed code that reads canonical rows.
-- 4. Confirm Editorial Studio has deployed code that can create revisions.

alter table public.ixai_weekly_intelligence_drafts
  add column if not exists revision_number integer,
  add column if not exists parent_weekly_id uuid references public.ixai_weekly_intelligence_drafts(id),
  add column if not exists is_canonical boolean default false,
  add column if not exists superseded_at timestamptz,
  add column if not exists superseded_by uuid references public.ixai_weekly_intelligence_drafts(id),
  add column if not exists revision_note text;

comment on column public.ixai_weekly_intelligence_drafts.revision_number is
  'Weekly revision number within the same week_start/week_end range. v1 rows are backfilled to 1.';
comment on column public.ixai_weekly_intelligence_drafts.parent_weekly_id is
  'Optional link to the canonical or previous weekly row used as the source for a revision draft.';
comment on column public.ixai_weekly_intelligence_drafts.is_canonical is
  'True only for the canonical published weekly row that public latest/archive surfaces should prefer.';
comment on column public.ixai_weekly_intelligence_drafts.superseded_at is
  'Timestamp when this weekly row stopped being canonical after a newer revision was published.';
comment on column public.ixai_weekly_intelligence_drafts.superseded_by is
  'The weekly row id that superseded this row as canonical.';
comment on column public.ixai_weekly_intelligence_drafts.revision_note is
  'Editorial note describing why a revision draft was created.';

update public.ixai_weekly_intelligence_drafts
set revision_number = 1
where revision_number is null;

update public.ixai_weekly_intelligence_drafts
set is_canonical = (status = 'published')
where is_canonical is distinct from (status = 'published');

alter table public.ixai_weekly_intelligence_drafts
  alter column revision_number set default 1,
  alter column revision_number set not null,
  alter column is_canonical set default false,
  alter column is_canonical set not null;

-- Replace the old one-row-per-week constraint.
drop index if exists ixai_weekly_intelligence_week_range_key;

create unique index if not exists ixai_weekly_intelligence_week_revision_key
  on public.ixai_weekly_intelligence_drafts (week_start, week_end, revision_number);

-- Ensure public canonical behavior: only one published canonical row per week.
create unique index if not exists ixai_weekly_intelligence_one_canonical_published_key
  on public.ixai_weekly_intelligence_drafts (week_start, week_end)
  where status = 'published' and is_canonical = true;

create index if not exists ixai_weekly_intelligence_parent_weekly_idx
  on public.ixai_weekly_intelligence_drafts (parent_weekly_id);

