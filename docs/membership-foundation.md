# IXAI Membership Foundation

v1.37.1 introduces the first monetization foundation for IXAI without adding
Stripe, checkout, auth migration, or paywall behavior.

## Why No Auth Yet

This phase links subscriber identity to a membership record, but it does not
create a login requirement or billing session. The goal is to make the product
ready for monetization while keeping public distribution, editorial publishing,
and analytics stable.

## Data Model

Migration:

```text
supabase/migrations/008_memberships.sql
```

Table:

```text
public.ixai_memberships
```

Core fields:

- `normalized_email`
- `plan`: `free`, `pro`, `enterprise`
- `status`: `active`, `expired`, `cancelled`, `trial`
- `started_at`
- `expires_at`
- `metadata`

RLS is enabled. Anonymous and authenticated clients have no table access. Server
routes write through the Supabase service role only.

## Repository Layer

`src/lib/membership/memberships.ts` provides:

- `normalizeEmail()`
- `getMembershipByEmail()`
- `upsertMembership()`
- `isProMember()`
- `getMembershipSnapshot()`

When Supabase service-role env is missing, local development uses memory mode.
When Supabase is configured but the table or permissions fail, server routes
surface a safe 502 instead of pretending the write succeeded.

## Entitlement Layer

`src/lib/membership/entitlements.ts` centralizes future access rules:

- `canAccessPro()`
- `canAccessFCN()`
- `canAccessDailyPremium()`
- `canAccessWeeklyPremium()`

Today these rules are not used as paywalls. They exist so future Stripe and
enterprise plans can plug into a single entitlement boundary.

## Public To Pro Identity Bridge

Email capture now creates or refreshes a free membership record after the
subscriber record is persisted.

```text
email capture
  -> distribution subscriber
  -> membership upsert(plan=free, status=active)
  -> future Pro conversion candidate
```

Existing Pro or enterprise memberships are not downgraded by a free email
capture.

## Stripe-Ready Path

Future Stripe integration should update `ixai_memberships` from trusted server
webhooks only:

- checkout completed -> `plan=pro`, `status=active`
- subscription cancelled -> `status=cancelled`
- trial started -> `status=trial`
- subscription expired -> `status=expired`

Client-side UI should never write paid entitlements directly.

## Admin Snapshot

`/api/admin/membership/snapshot` returns aggregated metrics only:

- total members
- active pro
- trials
- expired
- conversion candidates
- top plans

No raw email list is exposed.

## Deferred

- Stripe Checkout
- Webhook verification
- Billing portal
- Auth/session membership binding
- Real Pro feature gating
- Enterprise workspace management
