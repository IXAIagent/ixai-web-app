# v1.90 — Portfolio Input Foundation + Global Asset Model Foundation

## Summary

v1.90 establishes the first unified asset input foundation for IXAI. It adds an App-native Asset Input Hub at `/my-ixai/input` and defines a pure TypeScript model layer for future FCN, Stock, Crypto, Grid, Dual, and Cash input workflows.

This is a foundation version. It does not add CRUD, CSV parsing, broker sync, market data, AI, news ingestion, payment, trading, or database schema changes.

## Why

v1.80-v1.89 completed the Portfolio / FCN persistence layer, FCN Risk Engine, FCN Intelligence Layer, Portfolio Intelligence Dashboard, Membership / Entitlement Foundation, Multi-Asset Foundation, Portfolio Center UI, and Architecture Map.

The next product risk is fragmented input. IXAI needs one shared language for assets before expanding into:

- Manual input.
- CSV import.
- Broker sync.
- Exchange sync.
- Bank statement import.
- Holding-aware news intelligence.
- Multi-language Portfolio workflows.

## Route

`/my-ixai/input`

This route is the Asset Input Hub. It is separate from:

- `/portfolio`: Portfolio creation / input and product explanation.
- `/my-ixai/portfolio`: Portfolio Center dashboard / readback / architecture visualization.

## Input Strategy

v1.90 defines three input layers:

1. Manual Input: the near-term controlled input path.
2. CSV Import: template and validation foundation for future import flows.
3. Broker Sync: future integration layer, not active in this version.

CSV Import is directly informed by Legacy Pro asset import needs, but v1.90 does not migrate Legacy Pro implementation patterns.

## Supported Asset Categories

The foundation defines:

- FCN.
- STOCK.
- CRYPTO.
- GRID.
- DUAL.
- CASH.

These categories are model and UI foundation only. v1.90 does not add new database tables, API routes, or forms.

## Global Market Foundation

v1.90 reserves input regions:

- Taiwan.
- Hong Kong.
- China.
- Japan.
- Korea.
- United States.
- Europe.
- Global.

It also reserves language codes:

- `zh-TW`
- `zh-CN`
- `en-US`
- `ja-JP`
- `ko-KR`

No global i18n library is introduced.

## News Intelligence Preparation

The Asset Input Hub documents future holding-aware intelligence paths:

- Crypto related news.
- US stock news.
- Taiwan stock news.
- FCN underlying stock news.
- AI summary.
- IXAI perspective.
- Risk impact note.

This version does not add a news API, provider ingestion, AI generation, or scheduled jobs.

## New Model Files

- `src/lib/portfolio/input/asset-types.ts`
- `src/lib/portfolio/input/asset-schema.ts`
- `src/lib/portfolio/input/asset-normalizer.ts`
- `src/lib/portfolio/input/csv-import.ts`
- `src/lib/portfolio/input/i18n-foundation.ts`

The model layer is pure TypeScript and does not call Supabase, Next API routes, browser storage, external APIs, or AI services.

## UI

New component:

- `components/portfolio/asset-input-hub.tsx`

New route:

- `app/my-ixai/input/page.tsx`

Navigation:

- Desktop sidebar: adds `Asset Input` under the personal area.
- Mobile drawer: adds `Asset Input` under IXAI.
- Mobile bottom navigation already treats `/my-ixai/*` as the My IXAI area.

## Compliance Boundary

The Asset Input Hub is for asset organization, input workflow planning, and future risk monitoring.

It must not imply:

- Trading execution.
- Product recommendation.
- Personalized advice.
- Performance promises.
- Automated action.

## Out of Scope

- No migration.
- No Supabase schema change.
- No new API.
- No file upload storage.
- No real CSV parsing.
- No broker integration.
- No market data integration.
- No news API.
- No AI API.
- No payment / billing.
- No auth or membership / entitlement change.
- No Daily / Weekly / Social Pack / LINE work.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `/my-ixai/input` mobile audit at 375px.
- `/my-ixai/input` tablet audit at 768px.
- `/my-ixai/input` desktop audit.
- Confirm no horizontal overflow from fixed-width UI.
- Confirm no new API, migration, or schema file.

## Next

Candidate next steps:

- v1.91 Portfolio Input QA / Mobile Polish.
- v1.91 Stock / Crypto input planning.
- v1.92 CSV Import MVP.
- Billing Foundation only after Portfolio Center and Input UX remain stable.
