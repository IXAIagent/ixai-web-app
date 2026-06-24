# V10.60 Migration Execution Preparation

V10.60 prepares migration execution without running any remote migration.

It records:

- expected table list
- migration order
- preflight checks
- rollback notes
- post-migration validation checklist

Expected areas include profiles, workspace memberships, portfolio positions, stock positions, crypto positions, FCN positions, FCN underlyings, FCN coupon schedules, watchlists, watchlist items, and alert events.

No remote migration is executed. No production database, auth behavior, RLS policy, schema, broker integration, trading logic, or AI recommendation behavior is changed.
