# V14.0 Live Workspace Program

## Background

V12 production runtime stabilization has passed production manual verification. The Workspace no longer treats runtime stabilization as the active product blocker.

V12.3.1 completed optional personalization fallbacks so missing optional personalization resources do not create production Console noise or route instability.

V13.0 completed the Internationalization Foundation. IXAI now has a shared Public App + Workspace locale foundation for `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR`.

V14 now becomes the core product track. The goal is to move IXAI from a stable Workspace and i18n foundation into a daily usable Live Workspace.

V13 remains an internationalization side track. After V14 Beta is complete, return to V13.1 through V13.5 for dictionary migration, translation packs, region, currency, and localization.

## V14 Product Goal

IXAI should become a daily usable live risk-awareness workspace.

The V14 product direction includes:

- Live market data.
- Live portfolio valuation.
- FCN live risk.
- Workspace intelligence.
- Morning Brief.
- Beta readiness.

V14 is not a broker integration program, trading system, recommendation engine, or automated execution layer. It is a monitoring, explanation, and risk-awareness program.

## Program Sequence

### V14.1 Live Market Data

Scope:

- Yahoo Finance equity quotes.
- Binance crypto quotes.
- Provider health.
- Cache / fallback.
- No trading.
- No recommendation.

Sprint 1 status:

- Implemented through the internal `/api/market/live-quotes` route.
- Yahoo Finance equity quotes and Binance crypto quotes run server-side.
- Direct browser provider fetch remains disabled.
- Provider failures degrade to stale cache, fallback, or unavailable status.

Done direction:

- Live quote paths must have explicit provider status.
- Failed providers must degrade to fallback or unavailable states.
- Browser and server runtimes must not enter retry storms.
- The implementation must remain global-market-ready and not assume US-only symbols.

### V14.2 Live Portfolio Valuation

Scope:

- Stock valuation.
- Crypto valuation.
- Portfolio total value.
- Unrealized P/L.
- Allocation.
- Data quality warnings.

Sprint 1 status:

- Implemented as estimated live Portfolio valuation readback.
- Stock and Crypto positions use live quotes when available.
- FCN valuation remains notional placeholder only.
- Unknown quote data produces unpriced/unavailable items instead of route failure.

Done direction:

- Valuation must distinguish live, stale, unavailable, and fallback data.
- Missing quote or position data must not block route render.
- FCN valuation must remain clearly limited unless a separate FCN pricing plan is approved.

### V14.3 FCN Live Risk

Scope:

- Worst-of.
- KI distance.
- KO distance.
- Observation countdown.
- Maturity awareness.
- Coupon schedule awareness.
- No suitability advice.
- No product recommendation.

Sprint 1 status:

- Implemented as FCN live underlying risk readback.
- Supported underlyings use live quote data when available.
- Worst-of, KI distance, KO distance, strike/barrier distance, and schedule awareness are shown where source data exists.
- This remains monitoring-only and is not a full FCN pricing engine.

Done direction:

- FCN risk must remain monitoring-only.
- All FCN risk outputs must explain source quality and missing-data limitations.
- No output may imply buy / sell / hold guidance, product suitability, guaranteed coupon, or target return.

### V14.4 Workspace Intelligence

Scope:

- Home live dashboard.
- Risk summary.
- Copilot summary.
- Intelligence summary.
- All explain-only / monitoring-only.

Done direction:

- Workspace Intelligence should aggregate existing source layers rather than invent unsupported claims.
- Copilot and Intelligence summaries must remain explain-only and non-advisory.
- Runtime safety standards from V12 must remain in force for every refresh path.

### V14.5 Workspace Morning Brief

Scope:

- Daily Workspace Brief.
- FCN Brief.
- Watchlist context.
- Risk awareness.
- Share-ready brief.
- No AI trading signal.
- No automated notification delivery unless separately approved.

Done direction:

- Morning Brief content should be source-labeled and risk-aware.
- Share-ready output must preserve compliance language.
- Notification delivery and scheduler activation require separate approval.

### V14.6 Beta Readiness

Scope:

- Beta checklist.
- User feedback loop.
- Smoke tests.
- Production verification.
- Known limitations.

Done direction:

- Beta must document enabled, partial, and unavailable systems.
- Every major Workspace route must pass production-like smoke.
- Known limitations must be visible to the team before any public Beta claim.

## V13 Reminder

After V14 Beta is complete, return to:

- V13.1 Dictionary Migration.
- V13.2 Translation Packs.
- V13.3 Region.
- V13.4 Currency.
- V13.5 Localization.

V13.0 only established the foundation. It did not complete full translation, region formatting, currency formatting, or market-localized content behavior.

## Compliance Boundaries

IXAI is:

- Not a broker.
- Not a trading bot.
- Not a robo-advisor.
- Not a signal-selling product.

IXAI must not provide:

- Buy / sell / hold recommendations.
- Target prices.
- Guaranteed returns.
- Automated execution.
- Product suitability advice.
- Personalized investment instructions.

V14 must remain an intelligence, workflow, monitoring, and risk-awareness program.

## Technical Boundaries

V14 planning does not approve:

- Auth changes unless explicitly approved.
- RLS changes unless explicitly approved.
- Schema or migration changes unless a separate DB plan is approved.
- Billing changes.
- Broker integration.
- Scheduler or notification delivery activation.
- AI model calls unless separately approved.
- Trading, recommendation, or automated execution behavior.

V14 must preserve:

- Local fallback behavior.
- V12 runtime safety standards.
- Provider fallback semantics.
- Clear source and data quality labels.
- Global market readiness.

## Done Criteria

Each V14 phase must include:

- Docs updated.
- `git diff --check` pass.
- `npm run lint` pass when code changes are made.
- `npm run build` pass when code changes are made.
- `QA_PORT=3001 npm run qa:mobile` pass when route/UI code changes are made.
- Production-like smoke for affected routes.
- No runtime regression.
- No Console storm.
- No unhandled promise rejection storm.
- Clear fallback behavior.
- Clear source quality / data quality labels.
- Compliance boundaries preserved.

## Out Of Scope For V14.0 Planning

- No product code changes.
- No live market implementation.
- No auth, RLS, schema, migration, or Supabase policy changes.
- No billing.
- No broker integration.
- No trading or recommendation behavior.
- No AI model calls.
- No scheduler or notification delivery activation.
