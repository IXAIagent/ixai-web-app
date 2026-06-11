# v3.05 — Portfolio Workspace Foundation + CTA Fix

## Objective

v3.05 upgrades `/my-ixai/portfolio` from an engineering-heavy placeholder/dashboard surface into the first user-readable Portfolio Workspace homepage.

It also fixes CTA contrast on `/pro` so public conversion buttons remain visible on dark and light surfaces.

## Scope

### Portfolio Workspace Foundation

`/my-ixai/portfolio` now focuses on four user-facing sections:

1. Portfolio Overview.
2. Holdings Summary.
3. Risk Snapshot.
4. Quick Actions.

The page explains:

- What Portfolio Center is.
- Where assets belong.
- Why asset input matters before risk and intelligence readback.
- What the user should do next.

### CTA Contrast Fix

`/pro` CTA buttons now use explicit high-contrast text and background combinations.

Verified CTA surfaces:

- Hero: `免費開始使用`.
- Hero: `進入 IXAI Workspace`.
- Pricing: `了解方案`.
- Pricing: `加入等待名單`.
- Footer card: `免費開始使用`.
- Footer card: `進入 IXAI Workspace`.

## Portfolio Workspace Layout

### Portfolio Overview

Displays:

- Portfolio Center.
- Total Assets.
- Stocks.
- Crypto.
- FCN.

Current values are foundation placeholders. v3.05 does not add API calls, schema changes, or new persistence behavior.

### Holdings Summary

Displays user-friendly holding categories:

- 股票.
- Crypto.
- FCN.

When there is no data, the page says assets have not been created yet and sends users to Asset Input.

### Risk Snapshot

Explains future risk workflow without connecting real risk engines:

- 集中度.
- 風險監控.
- FCN Worst-of.
- Portfolio Exposure.

### Quick Actions

Links:

- `/my-ixai/input/stock`.
- `/my-ixai/input/crypto`.
- `/my-ixai/input/fcn`.

## Out of Scope

v3.05 does not change:

- API.
- Schema.
- Supabase.
- Auth.
- Membership.
- Entitlements.
- Broker integration.
- Market data.
- AI logic.
- Recommendation logic.
- Trading logic.

## Validation Checklist

- `/my-ixai/portfolio` loads at mobile, tablet, and desktop widths.
- `/pro` CTA text is visible.
- `/my-ixai/home` still loads.
- No horizontal overflow.
- Console errors = 0.
- `git diff --check` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `QA_PORT=3001 npm run qa:mobile` passes.

## Next

v3.06 can either polish the Workspace visual system or begin moving risk-heavy sections into Risk Center. It should avoid adding new investment features until Workspace IA is stable.
