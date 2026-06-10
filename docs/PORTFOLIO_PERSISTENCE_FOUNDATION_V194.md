# v1.94 — Portfolio Persistence Foundation

## Summary

v1.94 connects the v1.93 Portfolio Repository Foundation to the v1.92 Portfolio Data Model Foundation through a Supabase-backed repository implementation.

The active target flow is:

```text
UI
↓
Repository
↓
Supabase Persistence
```

This release only enables:

- Create Asset.
- Read Asset.

Update Asset and Delete Asset remain Coming Soon.

## Scope

v1.94 introduces:

- `src/lib/portfolio/repository/supabase-portfolio-repository.ts`
- `src/lib/portfolio/repository/portfolio-persistence-provider.ts`

No API route is added. The Asset Management Center uses the browser Supabase client and the authenticated user session, so all reads and writes remain under Supabase RLS.

## Existing Tables

v1.94 uses the v1.92 tables:

- `portfolio_accounts`
- `portfolio_assets`
- `portfolio_positions`

It does not create new tables, modify existing table schemas, or add a new migration.

## Repository Provider

`PortfolioPersistenceProvider` introduces:

```ts
type RepositoryMode = "mock" | "supabase";
```

`getPortfolioRepository()` can return:

- Mock Repository.
- Supabase Repository.

The Asset Management Center now uses Supabase mode.

## Supabase Repository

Implemented:

- `getAccounts()`
- `getAssets()`
- `getPositions()`
- `createAsset()`

Temporarily not implemented:

- `updateAsset()`
- `deleteAsset()`
- `createPosition()`
- `updatePosition()`
- `deletePosition()`

Those methods intentionally throw `Not implemented`.

## Asset Read

`/my-ixai/portfolio/assets` reads assets through:

```text
Asset Management Center
↓
PortfolioPersistenceProvider
↓
Supabase Repository
↓
portfolio_assets
```

## Asset Create

When the user creates an Asset, the Supabase repository:

1. Reads the authenticated user from Supabase Auth.
2. Finds the first active `MANUAL` portfolio account for the user.
3. Creates a default manual account if none exists.
4. Inserts into `portfolio_assets` with `user_id` set to the authenticated user.

No service role key is used.

## Ownership Boundary

All repository reads and writes include the authenticated `user_id`.

Supabase RLS remains the enforcement layer:

- User A cannot read User B assets.
- User A cannot insert assets into User B accounts.
- All writes rely on `auth.uid()` policies from v1.92.

Manual live User A / User B validation is still required before production release.

## Portfolio Center

`/my-ixai/portfolio` now shows:

- Repository Layer: Enabled.
- Persistence Layer: Enabled.
- Update / Delete: Coming Soon.

## Architecture Map

The Portfolio Architecture Map now shows:

```text
Portfolio Foundation
↓
Portfolio Input Foundation
↓
Portfolio CRUD Foundation
↓
Portfolio Data Model Foundation
↓
Portfolio Repository Foundation
↓
Portfolio Persistence Foundation
↓
Portfolio Dashboard
```

## Out of Scope

- No CSV Upload.
- No Broker Sync.
- No Market Data.
- No News API.
- No FCN Engine changes.
- No Intelligence Engine changes.
- No Risk Engine changes.
- No Update Asset persistence.
- No Delete Asset persistence.
- No auth change.
- No membership change.
- No entitlement change.
- No migration.
- No schema change.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Mobile QA at 375px.
- Tablet QA at 768px.
- Desktop QA at 1280px.
- Manual authenticated User A / User B ownership validation before production.

## Next

v1.95 CSV Import MVP can map rows into the same Repository contract and write to Supabase only after staging validation.
