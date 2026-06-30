# V14 Beta Release Review

Review date: 2026-06-30

## Background

V14 Beta Release Review closes the three V14 implementation Sprints and aligns release governance before invite-only Beta begins.

V14 is the Live Workspace mainline. It moves IXAI from a stable Workspace and i18n foundation into a daily usable, live, risk-aware Workspace. It remains monitoring, intelligence, workflow, and risk-awareness only.

## Source PRs / Sprint Summary

Source status:

- V14 Sprint 1 — Live Market Workspace: merged.
- V14 Sprint 2 — Workspace Intelligence + Morning Brief: merged.
- V14 Sprint 3 — Beta Readiness & Production Polish: PR #89 merged into `main`.
- Vercel production deployment status after Sprint 3 merge: Ready.

Source docs:

- `docs/V1400_LIVE_WORKSPACE_PROGRAM.md`
- `docs/V14_SPRINT_1_LIVE_MARKET_WORKSPACE.md`
- `docs/V14_SPRINT_2_WORKSPACE_INTELLIGENCE_BRIEF.md`
- `docs/V14_SPRINT_3_BETA_READINESS_POLISH.md`
- `docs/V14_BETA_RELEASE_NOTES.md`

## Sprint 1 Summary — Live Market Workspace

Sprint 1 completed V14.1 through V14.3:

- Internal server-side live quote route at `/api/market/live-quotes`.
- Yahoo Finance equity quotes and Binance crypto quotes through server-side providers.
- Short-lived in-memory quote cache with stale/fallback/unavailable behavior.
- Live Portfolio valuation readback for supported Stock and Crypto positions.
- FCN live underlying risk readback for supported symbols.
- Workspace Home, Portfolio, FCN, Risk, and Intelligence integration points.

Sprint 1 did not add trading, broker integration, recommendations, target prices, AI model calls, scheduler delivery, auth changes, RLS changes, schema changes, migrations, or billing behavior.

## Sprint 2 Summary — Workspace Intelligence + Morning Brief

Sprint 2 completed V14.4 and V14.5:

- Deterministic Workspace Intelligence cards under `src/lib/workspace/intelligence/`.
- On-demand Workspace Morning Brief under `src/lib/workspace/morning-brief/`.
- Timeline grouping for overdue, today, next 7 days, and later.
- Copilot manual Run summary with Workspace Intelligence and Morning Brief context.
- Home Morning Brief snapshot.
- Intelligence Center card and brief integration.

Sprint 2 remained rule-based and explain-only. It did not call AI models, create buy/sell/hold recommendations, generate target prices, produce trading signals, enable broker execution, or activate scheduled delivery.

## Sprint 3 Summary — Beta Readiness & Production Polish

Sprint 3 completed V14.6 implementation polish:

- Workspace Health Center at `/my-ixai/health`.
- Beta Readiness Dashboard at `/my-ixai/beta`.
- Morning Brief copy, Markdown export, and print-friendly view.
- Feedback template and static release notes framework.
- Health and Beta navigation entries.
- Production QA checklist and Beta release notes.

Sprint 3 PR #89 has merged into `main`. The feature mainline is functionally ready for invite-only Beta preparation, but invite-only Beta should begin only after the production verification checklist passes.

## Production / Deployment Status

- Production domain: `https://app.ixuan.ai`.
- Vercel deployment status after Sprint 3 merge: Ready.
- V14 Beta feature mainline: merged into `main`.
- Release review status: complete for docs/governance.
- Invite-only Beta status: not launched yet; pending production verification checklist.

## QA Validation Summary

Validation required for Sprint 3:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Production-like smoke for `/my-ixai/home`, `/my-ixai/intelligence`, `/my-ixai/copilot`, `/my-ixai/timeline`, `/my-ixai/risk`, `/my-ixai/fcn`, `/my-ixai/portfolio`, `/my-ixai/settings`, `/my-ixai/health`, and `/my-ixai/beta`

Expected production result:

- No white screen.
- No `RESULT_CODE_HUNG`.
- No repeated auth, optional-resource, provider, or Service Worker console storm.
- Health Center loads and manual refresh degrades safely.
- Beta dashboard loads.
- Morning Brief copy/export/print controls work.
- Feedback template and release notes are visible.

## Ready For Invite-Only Beta

The following capabilities are now ready for invite-only Beta verification:

- Workspace live market status for supported symbols.
- Estimated live Portfolio valuation readback.
- FCN live risk monitoring readback.
- Workspace Intelligence cards.
- On-demand Workspace Morning Brief.
- Timeline grouping.
- Copilot explain-only manual summary.
- Workspace Health Center.
- Beta Readiness Dashboard.
- Morning Brief share/export/print.
- Local feedback template.
- Static release notes.

## Still Not Enabled

V14 Beta does not enable:

- Broker integration.
- Trading.
- Buy / sell / hold recommendations.
- Target prices.
- AI model calls.
- Automated execution.
- Scheduler / Telegram / LINE / email delivery activation.
- Push notification delivery activation.
- Billing.
- Auth / RLS / schema / migration changes.
- External feedback storage.

## Known Limitations

- Live quote coverage is intentionally narrow.
- Yahoo and Binance provider checks are routed through the internal live quote API only.
- Quote cache is memory-only and may reset across deploys or server process changes.
- FCN valuation remains notional placeholder and is not a full FCN pricing engine.
- FCN live risk is monitoring-only and depends on available underlying, barrier, and schedule data.
- Morning Brief is generated on demand inside Workspace and is not delivered externally.
- Feedback is copy-only and is not submitted or stored by IXAI.
- V13.0 i18n is foundation-only; full translation, region formatting, currency formatting, and localized content remain pending.

## Beta Verification Checklist

Before inviting Beta users:

- Confirm Vercel production deployment is Ready for the merge commit.
- Open `/my-ixai/home` and confirm no white screen or fatal runtime error.
- Open `/my-ixai/portfolio` and confirm live valuation readback or safe fallback.
- Open `/my-ixai/fcn` and confirm FCN live risk readback or safe fallback.
- Open `/my-ixai/risk` and confirm risk surfaces render.
- Open `/my-ixai/intelligence` and confirm Workspace Intelligence and Morning Brief sections render.
- Open `/my-ixai/copilot` and run manual summary without route hang.
- Open `/my-ixai/timeline` and confirm grouped events render.
- Open `/my-ixai/settings` and confirm no runtime diagnostics hang.
- Open `/my-ixai/health` and run manual refresh.
- Open `/my-ixai/beta` and confirm readiness checklist / release notes / feedback template render.
- Confirm Morning Brief copy works.
- Confirm Markdown export works.
- Confirm print-friendly view opens.
- Switch among Workspace routes at least 10 times.
- Confirm no repeated `Uncaught (in promise)` storm.
- Confirm no repeated provider, auth, optional-resource, or Service Worker console flood.

## Recommended Next Steps

Recommended immediate track:

1. Run V14 Beta production verification on `https://app.ixuan.ai`.
2. If verification passes, start a small invite-only Beta pilot.
3. Record Beta feedback manually from the copied feedback template.
4. Return to the V13.1-V13.5 i18n track for dictionary migration, translation packs, region, currency, and localization.

Do not start broker integration, trading, recommendation, AI model call, scheduler delivery, billing, auth/RLS/schema migration, or external feedback-service work without a separate approved plan.
