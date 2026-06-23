# V6.20 Watchlist Persistence Schema Draft

Future durable watchlist storage may use:

## `watchlists`

- `id`
- `user_id`
- `name`
- `created_at`
- `updated_at`

## `watchlist_items`

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

This draft is documentation only and is not applied as a migration.
