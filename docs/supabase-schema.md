# IXAI Supabase Persistence Schema

v1.9.1 introduces Supabase-ready persistence for logged-in users while keeping
guest mode and localStorage fallback intact.

Use:

```txt
supabase/migrations/001_identity_persistence.sql
```

## Tables

### `ixai_watchlists`

Stores user-linked watchlist items.

Key columns:

- `user_id`
- `symbol`
- `name`
- `asset_type`
- `market`
- `note`
- `added_at`
- `created_at`
- `updated_at`

### `ixai_profile_memory`

Stores lightweight personal intelligence memory.

Key columns:

- `user_id`
- `watched_symbols`
- `recently_viewed_sections`
- `last_visit_at`
- `onboarding_completed`
- `created_at`
- `updated_at`

### `ixai_user_preferences`

Stores onboarding and feed preference profile.

Key columns:

- `user_id`
- `preferred_categories`
- `free_plan`
- `pro_plan`
- `created_at`
- `updated_at`

## RLS Summary

All three tables enable Row Level Security.

Each table uses a user-scoped policy:

```sql
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

This allows an authenticated user to select, insert, update, and delete only
their own rows. The app uses the public anon key plus the user's access token.
Do not expose or use a service role key in the client.

## App Fallback Behavior

If Supabase env vars are missing, the user is in guest mode, the access token is
missing, or the tables/RLS are not ready:

- watchlist remains localStorage-backed
- profile memory remains localStorage-backed
- preferences remain localStorage-backed
- UI shows Local only or Sync pending

This keeps the app usable while deployment setup is incomplete.
