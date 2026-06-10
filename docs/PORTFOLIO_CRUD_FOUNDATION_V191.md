# v1.91 — Portfolio CRUD Foundation MVP

## Summary

v1.91 upgrades the v1.90 Portfolio Input Foundation into the first visible Portfolio CRUD Foundation. It adds a mock-only Asset Management Center at `/my-ixai/portfolio/assets` where users can see the intended Create, Read, Update, and Delete interaction model for portfolio assets.

This is not a persistence release. It does not write to Supabase, does not add API routes, and does not add migrations.

## Goal

Create the first App-native Portfolio CRUD Layer foundation for:

- Create Asset.
- Read Asset.
- Update Asset.
- Delete Asset.

Supported asset categories follow the v1.90 Asset Model:

- FCN.
- STOCK.
- CRYPTO.
- GRID.
- DUAL.
- CASH.

## Route

`/my-ixai/portfolio/assets`

Purpose:

- Asset Management Center.
- Frontend state validation.
- Mobile-first UI validation.
- Foundation for future Supabase-backed asset CRUD.

## New Components

- `components/portfolio/asset-list.tsx`
- `components/portfolio/asset-card.tsx`
- `components/portfolio/asset-form.tsx`
- `components/portfolio/delete-asset-dialog.tsx`

## New Lib

- `src/lib/portfolio/crud/portfolio-crud-types.ts`
- `src/lib/portfolio/crud/portfolio-crud-schema.ts`
- `src/lib/portfolio/crud/portfolio-crud-mock.ts`

## Mock Data

v1.91 uses local mock data only:

- `FCN717N`
- `FCN715N`
- `BTC Grid`
- `ETH Grid`
- `USDT Cash`

Mock state supports create, edit, and archive-style delete inside the current browser session only. Refreshing the page resets the mock state.

## UI Behavior

The Asset Management Center displays:

- Asset Name.
- Asset Category.
- Region.
- Currency.
- Status.
- Created At.

The form supports:

- Asset Name.
- Asset Category.
- Region.
- Currency.
- Notes.

Delete uses a confirmation dialog with the copy `Are you sure?`.

## Architecture Integration

The Portfolio Center Architecture Map now includes:

```text
Portfolio Foundation
↓
Portfolio Input Foundation
↓
Portfolio CRUD Foundation
↓
Portfolio Dashboard
```

Navigation adds `Portfolio Assets` under My IXAI surfaces.

## Mobile First

v1.91 uses stacked cards on mobile and grid layout on desktop.

Requirements:

- 375px mobile support.
- 768px tablet support.
- 1280px desktop support.
- No horizontal overflow.
- No table-only layout.
- Buttons remain reachable on mobile.

## Out of Scope

- No Supabase write.
- No API route.
- No migration.
- No schema change.
- No auth change.
- No membership / entitlement logic change.
- No Broker API.
- No Binance API.
- No securities API.
- No News API.
- No AI API.
- No trading function.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Mobile QA at 375px.
- Tablet QA at 768px.
- Desktop QA at 1280px.

## Next

Future versions can decide whether to:

- Connect this UI to Supabase-backed asset CRUD.
- Expand Stock / Crypto / Cash inputs.
- Add CSV Import MVP.
- Keep Billing Foundation separate from Portfolio CRUD work.
