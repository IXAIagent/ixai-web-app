-- V11.40 manual split — Phase 04
-- Enable RLS and create policies for new V11 tables only.
--
-- REVIEW REQUIRED BEFORE PRODUCTION EXECUTION.
-- This file intentionally avoids changing existing table policies on:
-- portfolios, portfolio_positions, stock_positions, crypto_positions,
-- fcn_positions, and fcn_underlyings.
--
-- RLS notes:
-- - Policies depend on auth.uid().
-- - Rows with null owner_id/user_id may not be visible to authenticated users.
-- - These are conservative read policies plus workspace insert for owners.

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.fcn_coupon_schedules enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alert_history enable row level security;
alter table public.workspace_audit_logs enable row level security;

drop policy if exists "IXAI workspaces readable by owner" on public.workspaces;
create policy "IXAI workspaces readable by owner"
on public.workspaces for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists "IXAI workspaces insertable by owner" on public.workspaces;
create policy "IXAI workspaces insertable by owner"
on public.workspaces for insert to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "IXAI workspace members readable by member" on public.workspace_members;
create policy "IXAI workspace members readable by member"
on public.workspace_members for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI FCN coupon schedules readable by owner" on public.fcn_coupon_schedules;
create policy "IXAI FCN coupon schedules readable by owner"
on public.fcn_coupon_schedules for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI watchlists readable by owner" on public.watchlists;
create policy "IXAI watchlists readable by owner"
on public.watchlists for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI watchlist items readable by owner" on public.watchlist_items;
create policy "IXAI watchlist items readable by owner"
on public.watchlist_items for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI alert history readable by owner" on public.alert_history;
create policy "IXAI alert history readable by owner"
on public.alert_history for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI workspace audit logs readable by owner" on public.workspace_audit_logs;
create policy "IXAI workspace audit logs readable by owner"
on public.workspace_audit_logs for select to authenticated
using (auth.uid() = owner_id or auth.uid() = actor_id);

revoke all on public.workspaces from anon;
revoke all on public.workspace_members from anon;
revoke all on public.fcn_coupon_schedules from anon;
revoke all on public.watchlists from anon;
revoke all on public.watchlist_items from anon;
revoke all on public.alert_history from anon;
revoke all on public.workspace_audit_logs from anon;

grant select, insert, update on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;
grant select on public.fcn_coupon_schedules to authenticated;
grant select on public.watchlists to authenticated;
grant select on public.watchlist_items to authenticated;
grant select on public.alert_history to authenticated;
grant select on public.workspace_audit_logs to authenticated;
