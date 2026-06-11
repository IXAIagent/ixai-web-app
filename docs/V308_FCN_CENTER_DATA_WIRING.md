# v3.08 — FCN Center Data Wiring

## Objective

v3.08 establishes the first complete FCN data flow inside IXAI Workspace:

```text
FCN Input
↓
FCN Draft Store
↓
FCN Center
```

This release does not add a new risk engine, market data provider, broker connection, API route, Supabase schema, migration, AI provider, Telegram integration, or trading logic.

## Scope

- Convert `/my-ixai/fcn` from a route placeholder into the first FCN Workspace readback surface.
- Add a local FCN Draft Store for user-entered FCN draft conditions.
- Wire `/my-ixai/input/fcn` submit flow into the FCN Draft Store.
- Display FCN draft data in FCN Center.
- Keep the implementation local/mock and frontend-only.

## Data Flow

```text
/my-ixai/input/fcn
  FCN Wizard
    Basic Info
    Barrier
    Observation
    Observation Dates
    Underlyings
    Review
↓
src/lib/portfolio/input/fcn-draft-store.ts
↓
/my-ixai/fcn
  FCN Overview
  FCN Position Table
  Underlying Exposure
  Coupon Calendar
  FCN Detail Panel
```

The store uses local browser storage and a browser event to keep Workspace surfaces synchronized.

## v3.08a Draft Store Fix

v3.08a tightens the data wiring after a production-like check showed that FCN Center could appear while a newly created FCN draft was not visible.

Fixes:

- `FCNWizard` submit now writes directly to the local FCN Draft Store.
- The FCN Draft Store exports and uses one canonical key: `ixai.fcn.drafts.v308`.
- FCN Center reads the same key on mount.
- FCN Center also reloads drafts on `focus`, `pageshow`, and cross-tab `storage` events.
- `Portfolio Recent Inputs` and `FCN Draft Store` remain separate stores, but FCN submit writes to both.
- If the draft store is empty but legacy Recent Inputs contain FCN entries, FCN Center hydrates minimal legacy draft readback instead of showing an empty state.

This keeps the v3.08 flow local/browser-only while preventing navigation or reload from losing draft visibility.

## FCN Center Sections

### 1. FCN Overview

Displays:

- Total FCN Count.
- Total Notional.
- Upcoming Coupons Count.
- Unique Underlyings Count.

### 2. FCN Position Table

Displays each draft FCN with:

- FCN Name.
- Currency.
- Notional.
- Strike.
- KI.
- KO.
- Observation Frequency.
- Underlying Count.
- Created Date.

The layout is responsive card-based rather than a table-only layout.

### 3. Underlying Exposure

Aggregates user-entered FCN underlyings across drafts:

- Example: `MDB × 3`, `TSLA × 2`, `MSFT × 1`.
- Uses only symbols entered by the user.
- Does not calculate market risk or price movement.

### 4. Coupon Calendar

Displays user-entered:

- Observation Date.
- Coupon Date.
- Observation Frequency.

No market calculation, schedule inference, or external calendar provider is added.

### 5. FCN Detail Panel

Selecting an FCN expands:

- Basic Info.
- Barrier Info.
- Observation Info.
- Underlying List.

## Legacy Alignment

v3.08 borrows the product shape from the legacy FCN monitor:

- Worst-of awareness.
- KI / KO visibility.
- Underlyings.
- Coupon schedule.

It does not migrate:

- Yahoo calls.
- Binance calls.
- AI calls.
- Telegram.
- Scheduler.
- Legacy auth.
- Legacy backend templates.

## Validation Checklist

- `/my-ixai/input/fcn` can create a local FCN draft.
- `/my-ixai/fcn` can read the draft.
- FCN Center shows notional, strike, KI, KO, observation, coupon, and underlyings.
- `/my-ixai/portfolio` still shows recent FCN input through the existing Recent Inputs panel.
- Reloading `/my-ixai/fcn` keeps the draft visible because the source is localStorage, not React state.
- Opening `/my-ixai/fcn` in another tab on the same origin keeps the draft visible.
- Mobile layout remains single-column at 375px.
- No API route, schema, migration, broker, market data, AI provider, Telegram, or trading change.

## Known Limitations

- FCN drafts are local browser state, not durable Supabase persistence.
- There is no edit/delete flow in FCN Center yet.
- There is no real market price, Worst-of calculation, KI distance, KO distance, or coupon accrual engine in this wiring release.
- Cross-device sync is not available until future persistence work.

## Next

Recommended next steps:

- v3.08.x: FCN draft edit/delete if needed.
- v3.09: Intelligence Center migration.
- Future FCN phase: persistent FCN Center, KI / KO monitoring, coupon schedule engine, and global FCN support.
