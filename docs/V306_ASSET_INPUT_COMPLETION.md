# v3.06 Asset Input Completion

Date: 2026-06-11

## Objective

Upgrade the Workspace Asset Input Center from placeholder pages into usable asset-input surfaces for Stock / ETF, Crypto, and FCN.

This version follows the migration priority from `docs/LEGACY_BACKEND_INVENTORY_AUDIT_V305A.md`: start with input flow and FCN input experience before moving into Risk Center decomposition.

## Scope

Included:

- `/my-ixai/input/stock` Stock / ETF input form.
- `/my-ixai/input/crypto` Crypto input form.
- `/my-ixai/input/fcn` FCN Wizard UX completion.
- Shared `Input Review` summary pattern.
- Local mock Recent Inputs readback on `/my-ixai/portfolio`.

Not included:

- No Supabase schema changes.
- No migration.
- No new API route.
- No broker integration.
- No market data provider.
- No external AI provider.
- No recommendation or trading logic.
- No membership or entitlement logic changes.

## Stock Input

Route:

`/my-ixai/input/stock`

Fields:

- Ticker.
- Asset Name, optional.
- Quantity.
- Cost Basis.
- Currency.
- Market: US, TW, HK, JP, KR, EU.

The route now includes:

- Client-side validation.
- Position Preview.
- Shared Input Review.
- Local mock submit that records the latest Stock input.

## Crypto Input

Route:

`/my-ixai/input/crypto`

Fields:

- Asset: BTC, ETH, SOL, BNB, XRP, DOGE, ADA, USDT, USDC, Other.
- Quantity.
- Cost Basis.
- Wallet / Exchange: Binance, Bybit, OKX, Wallet, Other.

The route now includes:

- Client-side validation.
- Position Preview.
- Shared Input Review.
- Local mock submit that records the latest Crypto input.

## FCN Input

Route:

`/my-ixai/input/fcn`

The existing FCN Wizard remains the canonical FCN input UX. v3.06 extends it with:

- Basic Information: FCN Name, Issuer, Currency, Notional, Coupon, Tenor.
- Barrier: Strike, KI, KO, Coupon.
- Observation Frequency: Monthly, Quarterly, Semiannual, Annual.
- Observation Dates: Observation Date and Coupon Date with dynamic Add / Remove.
- Underlyings: 1 to 6 underlyings with name, symbol, market, initial price, current price, KI, KO, strike, and optional weight.
- Final shared Input Review before submit.

The existing `/api/fcn` submit path is preserved. New v3.06 metadata such as tenor and observation frequency is treated as Workspace input metadata and local review context only; it does not change the backend API or database schema.

## Review Summary

Shared review behavior now exists for:

- Stock.
- Crypto.
- FCN.

Each summary shows:

- Asset Type.
- Key Fields.
- Risk Fields.
- Observation Fields where applicable.

## Portfolio Workspace Integration

`/my-ixai/portfolio` now includes a `Recent Inputs` section.

It reads local mock state only and displays:

- Latest Stock Input.
- Latest Crypto Input.
- Latest FCN Input.

This keeps the Workspace flow understandable:

```text
Workspace
→ Asset Input
→ Stock / Crypto / FCN
→ Input Review
→ Recent Inputs
→ Portfolio
→ Risk / FCN / Intelligence
```

## Legacy Alignment

v3.06 uses the v3.05a audit as its boundary:

Reusable ideas:

- FCN underlyings UX.
- FCN observation / coupon date UX.
- Input validation concepts.
- Review-before-submit flow.

Rejected legacy patterns:

- Legacy Auth.
- Legacy JWT.
- Legacy API calls.
- Legacy templates.
- Direct browser-to-FastAPI protected calls.

## Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Route smoke:

- `/my-ixai/input`
- `/my-ixai/input/stock`
- `/my-ixai/input/crypto`
- `/my-ixai/input/fcn`
- `/my-ixai/portfolio`

Mobile:

- 375px.
- 768px.
- 1280px.
- No horizontal overflow.
- No console errors.

## Impact

- API: none.
- Schema: none.
- Migration: none.
- Auth: unchanged.
- Membership: unchanged.
- Entitlement: unchanged.
- Broker: none.
- Market data: none.
- External AI: none.
- Trading logic: none.
