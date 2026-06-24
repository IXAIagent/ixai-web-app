# V9 Database Migration Health Check

This companion document records the V9 migration health diagnostics required by the Real Persistence Program.

## Expected Tables

- `profiles`
- `workspace_memberships`
- `portfolio_positions`
- `stock_positions`
- `crypto_positions`
- `fcn_positions`
- `fcn_underlyings`
- `fcn_coupon_schedules`
- `watchlists`
- `watchlist_items`
- `alert_events`

## Runtime Rule

All tables remain optional at runtime. Missing tables must return safe unavailable or fallback status. No migration is applied automatically.

## RLS Rule

RLS remains draft-only unless future schema work explicitly applies policies. Future live queries must be user-scoped by `user_id` or `owner_id` where applicable.
