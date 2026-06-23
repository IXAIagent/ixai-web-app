# V8 Database Schema Activation Draft

This document is a draft only. Do not apply it automatically.

## Shared Requirements

- Every user-owned table should include `user_id`.
- Every persisted table should include `created_at` and `updated_at`.
- Every table should preserve local fallback compatibility by not becoming a runtime requirement until explicitly migrated.
- RLS policies should restrict users to their own rows.

## Tables

### `profiles`

- `id uuid primary key`
- `email text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `portfolio_positions`

- `id uuid primary key`
- `user_id uuid`
- `portfolio_id uuid`
- `asset_class text`
- `symbol text`
- `name text`
- `quantity numeric`
- `notional_amount numeric`
- `currency text`
- `source_status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `stock_positions`

- `id uuid primary key`
- `user_id uuid`
- `portfolio_id uuid`
- `symbol text`
- `name text`
- `quantity numeric`
- `average_cost numeric`
- `currency text`
- `market text`
- `source_status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `crypto_positions`

- `id uuid primary key`
- `user_id uuid`
- `portfolio_id uuid`
- `symbol text`
- `name text`
- `quantity numeric`
- `average_cost numeric`
- `currency text`
- `wallet_or_exchange text`
- `source_status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `fcn_positions`

Existing table remains active where available. Future activation should confirm `user_id`, `portfolio_id`, and RLS policies.

### `fcn_underlyings`

Existing table remains active where available. Future activation should confirm `user_id`, `fcn_position_id`, and RLS policies.

### `fcn_coupon_schedules`

- `id uuid primary key`
- `user_id uuid`
- `fcn_position_id uuid`
- `event_type text`
- `observation_date date`
- `coupon_date date`
- `payment_date date`
- `expected_coupon_amount numeric`
- `currency text`
- `source_status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `watchlists`

- `id uuid primary key`
- `user_id uuid`
- `name text`
- `source_status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `watchlist_items`

- `id uuid primary key`
- `watchlist_id uuid`
- `user_id uuid`
- `symbol text`
- `name text`
- `asset_type text`
- `target_price numeric`
- `alert_above numeric`
- `alert_below numeric`
- `note text`
- `source_status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `alert_events`

- `id uuid primary key`
- `user_id uuid`
- `category text`
- `severity text`
- `title text`
- `message text`
- `source_engine text`
- `source_status text`
- `created_at timestamptz`
- `read_at timestamptz`

## RLS Policy Draft

For each user-owned table:

```sql
alter table <table_name> enable row level security;

create policy "Users can read own rows"
on <table_name>
for select
using (auth.uid() = user_id);
```

Write policies should be reviewed separately before any UI write is enabled.

## Index Drafts

- Index all `user_id` columns.
- Index `portfolio_id` on portfolio-related tables.
- Index `fcn_position_id` on FCN child tables.
- Index `watchlist_id` on `watchlist_items`.
- Index `created_at` on `alert_events`.
