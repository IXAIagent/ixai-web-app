# V14 Sprint 2 — Workspace Intelligence + Morning Brief

## Background

V14 Sprint 1 completed the live market workspace foundation for server-side live quotes, live portfolio valuation, and FCN live risk readback.

V14 Sprint 2 moves that foundation into Workspace-readable intelligence: deterministic summary cards, an on-demand Morning Brief, Timeline grouping, Copilot explain-only summaries, and Home / Intelligence integration.

## Scope

Included:

- Workspace Intelligence Engine under `src/lib/workspace/intelligence/`.
- Workspace Morning Brief under `src/lib/workspace/morning-brief/`.
- Timeline grouping enhancement for overdue, today, next 7 days, and later.
- Copilot manual Run summary upgrade with Workspace Intelligence and Morning Brief context.
- Home Morning Brief snapshot integration.
- Intelligence Center detailed cards and brief integration.

Not included:

- AI model calls.
- Buy / sell / hold recommendations.
- Target prices.
- Trading signals.
- Broker integration or execution.
- Auth, RLS, schema, migration, or billing changes.
- Scheduler, Telegram, LINE, email, or push notification delivery.

## Workspace Intelligence Engine

The V14 Workspace Intelligence layer aggregates existing source systems:

- Portfolio valuation.
- Portfolio risk.
- FCN live risk.
- Watchlist readback.
- Alert readback.
- Workspace Timeline.
- Data quality and source status.

The output is a deterministic card model with:

- `id`
- `type`
- `title`
- `severity`
- `summary`
- `details`
- `source`
- `generatedAt`
- `dataQuality`
- disclaimer

The engine is explain-only and monitoring-only. It does not invent unsupported claims and does not provide investment advice.

## Workspace Morning Brief

The Morning Brief is generated on demand inside Workspace.

Sections:

- Opening summary.
- Market snapshot.
- Portfolio snapshot.
- FCN risk snapshot.
- Watchlist movement.
- Risk alerts.
- Timeline / upcoming events.
- Data quality / missing data.
- Compliance note.

The brief is Workspace-readable only in this Sprint. No scheduled delivery, external notification, Telegram, LINE, email, or push send is enabled.

## Timeline Enhancement

Timeline now groups events by:

- Overdue.
- Today.
- Next 7 Days.
- Later.

FCN coupon, observation, KO observation, maturity, alert, and data-quality events remain source-labeled. Unknown dates are not invented. If a source is unavailable, Timeline may show a generated data-quality event using the current generated timestamp rather than fabricating market or FCN event dates.

## Copilot Summary Upgrade

Workspace Copilot remains manual and explain-only.

The initial Copilot shell stays lightweight. Pressing Run summary can include:

- Portfolio summary.
- FCN summary.
- Risk summary.
- Watchlist / alerts.
- Data quality.
- Morning Brief status.

No AI chat completion, target price, buy/sell/hold, recommendation, or order instruction is added.

## Home / Intelligence Integration

Home shows a V14 Morning Brief snapshot with manual Run brief behavior so route entry stays lightweight.

Intelligence Center shows:

- V14 Workspace Intelligence cards.
- V14 Morning Brief detail.
- Source status and generated timestamp.
- Existing Intelligence and market readiness layers.
- Monitoring-only boundary language.

## Runtime Safety

Runtime safety rules:

- Source aggregation uses settled/fallback behavior.
- UI refreshes run through Workspace runtime budget guards.
- Home does not mount-trigger heavy diagnostics.
- Copilot summary remains manual.
- External provider and source failures degrade to fallback cards instead of throwing to React.
- A short memory cache reduces repeat route-switch refresh cost.

## Compliance Boundaries

IXAI remains:

- Not a broker.
- Not a trading bot.
- Not a robo-advisor.
- Not a signal-selling product.

This Sprint does not add:

- Buy / sell / hold recommendations.
- Target prices.
- Guaranteed returns.
- Automated execution.
- Product suitability advice.
- AI model commentary.

## Out of Scope

- V14.6 Beta Readiness.
- Full global quote coverage.
- Full content localization.
- External news provider activation.
- Scheduler or notification delivery activation.
- Schema, migration, auth, RLS, membership, billing, broker, trading, or recommendation changes.

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Production-like smoke routes:

- `/my-ixai/home`
- `/my-ixai/intelligence`
- `/my-ixai/copilot`
- `/my-ixai/timeline`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/portfolio`
- `/my-ixai/settings`

Expected:

- Home Morning Brief card renders.
- Intelligence cards load.
- Timeline loads.
- Copilot initial shell does not auto-run heavy work.
- Copilot Run summary works.
- No white screen.
- No `RESULT_CODE_HUNG`.
- No repeated 401 / 404 / provider storm.

## Known Limitations

- Intelligence is rule-based and source-limited.
- Missing portfolio, FCN, watchlist, alert, or timeline data produces fallback summaries.
- Morning Brief is not delivered outside Workspace.
- Source caches are short-lived and memory-only.
- V14.6 Beta Readiness remains pending.

## Next Sprint

V14 Sprint 3 should complete V14.6 Beta Readiness: beta checklist, user feedback loop, production verification, known limitations, and visible enabled / partial / unavailable systems.

After V14 Beta, return to the V13 i18n track for dictionary migration, translation packs, region, currency, and localization.
