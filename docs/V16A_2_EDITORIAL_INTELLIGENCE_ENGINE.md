# V16A-2 Editorial Intelligence Engine + Weekly Brief Foundation

Review date: 2026-07-06

## Executive Summary

V16A-2 adds the shared Editorial Intelligence Engine for IXAI AI Financial Media.

This is a foundation layer for Daily Brief 2.0 and Weekly Brief 2.0. It does not fetch external providers, call AI models, auto-publish scheduler output, deliver notifications, change database schema, or introduce Workspace monitoring.

The product boundary remains:

- Public Daily / Weekly answer: `今天市場發生什麼？`
- Workspace monitoring answers: `今天哪些事情影響我的投資？`

## Implemented Items

### Theme Engine

Added deterministic theme detection for:

- AI
- Semiconductor
- Fed / Rates
- US Tech
- Taiwan Market
- Crypto
- Energy
- China
- Macro Risk
- FCN / Structured Products

The engine maps normalized editorial stories to IXAI-owned theme IDs and labels. It uses story title, summary, categories, markets, and symbols. It does not depend on provider-specific response shapes.

### Story Relationship Engine

Added relationship detection for:

- same company
- same sector
- same theme
- macro impact
- supply chain relation
- risk relation
- follow-up relation

Relationships are deterministic and derived from normalized stories plus detected themes.

### Editorial Signals Engine

Added rule-based signal detection for:

- breaking
- developing
- follow-up
- market-moving
- background
- macro
- company
- crypto
- risk
- structured-product

Signals are used by narrative priority and diagnostics. They do not trigger notifications or user delivery.

### Narrative Priority Engine

Added a deterministic narrative priority model that combines:

- topic rank
- related signal count
- related theme coverage
- source diversity
- market impact

This helps Daily / Weekly decide which narratives should appear first without calling an AI provider.

### Confidence Layer

Added separate confidence dimensions:

- source confidence
- topic confidence
- narrative confidence
- coverage confidence

These values are transparent diagnostics and do not imply investment recommendation confidence.

### Coverage Layer

Added coverage diagnostics for:

- covered themes
- missing themes
- low coverage areas
- duplicate-heavy areas
- source diversity

Coverage is used to degrade output when data is limited instead of failing the public brief.

### Editorial Intelligence Engine

Added shared orchestration:

```text
Ranked Stories
↓
Ranked Topics
↓
Theme Engine
↓
Story Relationships
↓
Editorial Signals
↓
Narrative Priority
↓
Confidence Layer
↓
Coverage Layer
↓
Editorial Intelligence Result
```

Both Daily Brief 2.0 and Weekly Brief 2.0 use the same intelligence result.

## Weekly Brief 2.0 Foundation

Added Weekly Brief 2.0 foundation under `src/lib/editorial/weekly-brief/`.

The snapshot includes:

- week range
- title
- weekly review
- top themes
- important stories
- narrative summary
- next week radar
- risk notes
- coverage status
- quality signals
- fallback state
- no-investment-advice disclaimer

Weekly Brief 2.0 is a deterministic public media preview. It is not seven Daily Briefs stitched together, and it does not use user portfolio data.

## Daily / Weekly Integration

### Daily Brief 2.0

Daily Brief 2.0 now includes the shared Editorial Intelligence Engine result in its snapshot.

Public `/daily-brief` shows read-only intelligence diagnostics:

- theme count
- signal count
- narrative confidence

Admin `/admin/daily-briefs` shows read-only intelligence diagnostics without changing generate / review / publish behavior:

- theme count
- signal count
- relationship count
- narrative confidence
- coverage confidence

### Weekly Brief 2.0

Weekly Brief 2.0 uses the same normalized stories, story ranking, topic ranking, and Editorial Intelligence Engine.

Public `/weekly-brief` includes a read-only Weekly Brief 2.0 Foundation Preview.

Existing weekly published readback remains unchanged.

## Fallback / Degradation Behavior

V16A-2 follows the V16 failure degradation principle:

```text
Provider failure must degrade intelligence, not crash the product.
```

Foundation behavior:

- no stories -> limited brief
- low confidence -> limited coverage
- duplicate-heavy content -> suppressed / noted
- missing AI provider -> rule-based narrative only
- missing themes -> coverage diagnostics
- Social Pack unavailable -> non-blocking

## Files Added

- `src/lib/editorial/intelligence/editorial-theme-engine.ts`
- `src/lib/editorial/intelligence/story-relationship-engine.ts`
- `src/lib/editorial/intelligence/editorial-signals.ts`
- `src/lib/editorial/intelligence/narrative-priority.ts`
- `src/lib/editorial/intelligence/editorial-confidence.ts`
- `src/lib/editorial/intelligence/editorial-coverage.ts`
- `src/lib/editorial/intelligence/editorial-intelligence-engine.ts`
- `src/lib/editorial/intelligence/index.ts`
- `src/lib/editorial/weekly-brief/weekly-brief-types.ts`
- `src/lib/editorial/weekly-brief/weekly-brief-builder.ts`
- `src/lib/editorial/weekly-brief/weekly-brief-diagnostics.ts`
- `src/lib/editorial/weekly-brief/index.ts`

## Files Updated

- `src/lib/editorial/daily-brief/daily-brief-types.ts`
- `src/lib/editorial/daily-brief/daily-brief-builder.ts`
- `src/lib/editorial/index.ts`
- `app/daily-brief/page.tsx`
- `app/weekly-brief/page.tsx`
- `components/admin/daily-briefs-admin.tsx`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

## Out of Scope

V16A-2 does not add:

- external provider fetch
- OpenAI / Claude / Gemini / AI call
- scheduler auto-publish
- Telegram / LINE / Email delivery
- database schema or migration
- trading
- buy / sell / hold
- target price
- recommendation
- billing
- V16B Workspace monitoring

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- `git diff --cached --check`
