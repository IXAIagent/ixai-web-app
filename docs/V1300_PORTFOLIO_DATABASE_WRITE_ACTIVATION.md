# V13.00 Portfolio Database Write Activation

## Goal

V13.00 starts guarded database write activation for Workspace Portfolio inputs.
It moves Stock and Crypto input submit flows from local-only readback toward
Supabase-backed persistence while preserving the existing Truth Layer and local
fallback behavior.

## Scope

Implemented:

- Portfolio write guard metadata.
- Stock position guarded database write attempt after explicit Stock Input submit.
- Crypto position guarded database write attempt after explicit Crypto Input submit.
- Portfolio bootstrap through the existing `/api/portfolio` path when guards allow it.
- Local-first submit flow: Input Truth Bridge / recent input fallback is written before
  any database attempt.
- V13 diagnostics on Home, Settings, Database Activation Status, Platform Cutover
  Status, Workspace Graph, and Integration Audit.

Deferred:

- FCN Wizard database writes.
- FCN position / underlying / coupon schedule write cutover.
- Database-only behavior.
- Automatic fallback reconciliation.

## Guard Model

V13 writes require both:

- V12 global write cutover guard.
- V13 module-specific guard.

Module guards:

- `NEXT_PUBLIC_IXAI_V13_WRITE_PORTFOLIO`
- `NEXT_PUBLIC_IXAI_V13_WRITE_STOCK_POSITIONS`
- `NEXT_PUBLIC_IXAI_V13_WRITE_CRYPTO_POSITIONS`

Database writes are disabled by default. FCN writes are explicitly scope-disabled in
V13. Diagnostics are read-only and must not create workspaces, portfolios, or positions.

## Readback Priority

Workspace readback remains:

1. Supabase / database-backed APIs.
2. Portfolio Truth Layer pending inputs.
3. Local recent input fallback.
4. Empty state.

Empty database results must not erase pending or local fallback data.

## Files Changed

- `src/lib/workspace/portfolio-database-write-activation/`
- `components/workspace/workspace-v13-portfolio-database-write-activation-status.tsx`
- `components/portfolio/stock-input-form.tsx`
- `components/portfolio/crypto-input-form.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`
- `components/workspace/workspace-database-activation-status.tsx`
- `components/workspace/workspace-platform-cutover-status.tsx`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/graph/workspace-graph-types.ts`
- `src/lib/workspace/integration/integration-audit.ts`

## Boundaries

V13.00 does not:

- Execute migrations.
- Change Supabase schema or RLS.
- Change auth, onboarding, membership, or redirects.
- Enable FCN database writes.
- Connect broker, Binance, Yahoo Finance, or market data providers.
- Add trading logic, order execution, AI recommendations, buy/sell/hold guidance, or
  portfolio allocation advice.
- Remove Truth Layer, FCN Draft Store, localStorage, or deterministic fallback behavior.

## Next Step

Recommended next version:

- V14.00 FCN Database Activation, focused on guarded FCN Wizard / FCN Center database
  write cutover while preserving FCN Draft Store and `/api/fcn` readback.
