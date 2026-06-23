# V7 Persistence Schema Draft

This document is a draft only. No migration is applied in V7.0.

## Portfolio

### `portfolio_positions`

- `id`
- `user_id`
- `portfolio_id`
- `asset_class`
- `symbol`
- `name`
- `quantity`
- `notional_amount`
- `currency`
- `metadata`
- `created_at`
- `updated_at`

### `stock_positions`

- `id`
- `user_id`
- `portfolio_id`
- `symbol`
- `name`
- `quantity`
- `average_cost`
- `currency`
- `market`
- `created_at`
- `updated_at`

### `crypto_positions`

- `id`
- `user_id`
- `portfolio_id`
- `symbol`
- `name`
- `quantity`
- `average_cost`
- `currency`
- `wallet_or_exchange`
- `created_at`
- `updated_at`

## FCN

### `fcn_positions`

Existing table remains the active source where available.

### `fcn_underlyings`

Existing table remains the active source where available.

### `fcn_coupon_schedules`

- `id`
- `user_id`
- `fcn_position_id`
- `event_type`
- `observation_date`
- `coupon_date`
- `payment_date`
- `expected_coupon_amount`
- `currency`
- `created_at`
- `updated_at`

## Watchlist

### `watchlists`

- `id`
- `user_id`
- `name`
- `created_at`
- `updated_at`

### `watchlist_items`

- `id`
- `watchlist_id`
- `symbol`
- `name`
- `asset_type`
- `target_price`
- `alert_above`
- `alert_below`
- `note`
- `created_at`
- `updated_at`

## Alerts

### `alert_events`

- `id`
- `user_id`
- `category`
- `severity`
- `title`
- `message`
- `source_engine`
- `created_at`
- `read_at`

## Boundary

All tables here are future drafts. V7.0 runtime must continue to work without them.
