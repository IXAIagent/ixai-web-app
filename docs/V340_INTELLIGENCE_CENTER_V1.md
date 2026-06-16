# v3.40 Intelligence Center v1

## Why v3.40 Exists

After v3.20 FCN Intelligence Center and v3.30 Global Risk Center Foundation, `/my-ixai/intelligence` was still only a v3.00 placeholder. v3.40 turns it into the first usable Intelligence Center so users can understand where Daily / Weekly intelligence, market context, FCN highlights, portfolio-aware readiness, news readiness, and commentary readiness belong.

## What Intelligence Center Owns

Intelligence Center owns the user-facing workflow for:

- Daily Brief entry.
- Weekly Intelligence entry.
- Market Overview entry.
- Portfolio-aware highlights.
- FCN intelligence highlights.
- News Feed readiness.
- Commentary readiness.
- Future Legacy Pro intelligence migration concepts.

## What Intelligence Center Does Not Own

v3.40 does not own:

- Order execution.
- Broker sync.
- Live market data provider setup.
- External news provider setup.
- OpenAI, Claude, Gemini, Anthropic, LangChain, or LlamaIndex integration.
- Buy / sell recommendations.
- Personalized portfolio allocation advice.
- Public Daily / Weekly editorial workflows.
- Social Pack production workflows.

## Relationship To Legacy Pro Migration Audit

`docs/LEGACY_PRO_MIGRATION_AUDIT_V211.md` and `docs/LEGACY_BACKEND_INVENTORY_AUDIT_V305A.md` identify portfolio-aware news relevance, market priority, Daily / Weekly ownership, watchlist memory, and FCN monitoring highlights as high-value concepts.

v3.40 migrates those concepts only as App-native workspace structure and readiness states. It does not copy legacy JWT auth, localStorage token auth, legacy templates, old AppShell, direct FastAPI protected browser calls, Telegram delivery, broker integrations, or LLM summarizer hooks.

## Relationship To Public Market Page

The public `/market` route remains the market overview source. v3.40 links to it and labels it as the current public source. It does not duplicate market components, create a new market-data provider, or claim real-time Workspace market intelligence.

## Relationship To FCN Center And Risk Center

FCN highlights reuse the v3.20 FCN Intelligence Center readback and manual price overlay. The Intelligence Center does not duplicate FCN calculations.

Risk Center remains the owner of Global Risk Center readback. Intelligence Center links to Risk Center as the review surface for FCN-led global risk status and source readiness.

## Data Sources Used In v3.40

Allowed existing sources:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`
- v3.20 FCN Intelligence Center helpers
- v3.20 manual FCN price overlay
- Public routes `/daily-brief`, `/weekly-brief`, and `/market`
- Existing mock Portfolio News / Commentary foundation, labeled as readiness only

No new API route is added.

## Placeholder / Readiness Boundaries

Real:

- Daily / Weekly / Market entry points.
- Authenticated API readback for FCN / Stock / Crypto / Portfolio Dashboard where user data exists.
- FCN summary and upcoming FCN event counts from existing helper output.

Readiness:

- Portfolio-aware news.
- AI commentary.
- External news provider.
- External AI provider.
- Workspace-specific market integration.

## Compliance Boundaries

v3.40 is monitoring and intelligence workflow only.

It does not provide:

- Investment recommendations.
- Buy / sell instructions.
- Order execution.
- Auto trading.
- Return promises.
- AI advisory behavior.

## UI Sections

`/my-ixai/intelligence` now includes:

1. Intelligence Overview.
2. Today's Portfolio-Aware Highlights.
3. FCN Intelligence Highlights.
4. Upcoming FCN Events.
5. Market Intelligence Snapshot.
6. News Feed Readiness.
7. Commentary Readiness.
8. Next Action Panel.
9. Source Status.
10. Compliance Footer.

## Future v3.41 / v3.42 Direction

v3.41 should focus on portfolio-aware news relevance using deterministic rules and existing portfolio / FCN / stock / crypto data. It should not connect external news providers yet unless provider governance is approved.

v3.42 should focus on commentary and intelligence memory readiness, still without external LLM integration unless AI provider governance, cost controls, audit logs, and compliance copy are approved.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Local route smoke: `GET /my-ixai/intelligence` returns `200 OK`
- Confirm `/my-ixai/intelligence` is no longer placeholder-only.
- Confirm public Daily / Weekly / Market routes remain unchanged.
