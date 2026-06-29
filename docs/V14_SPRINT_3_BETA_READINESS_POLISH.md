# V14 Sprint 3 — Beta Readiness & Production Polish

## Background

V14 Sprint 1 completed Live Market Workspace foundations. V14 Sprint 2 completed rule-based Workspace Intelligence and on-demand Workspace Morning Brief.

V14 Sprint 3 is the final V14 implementation Sprint before inviting the first Beta users. It focuses on readiness, polish, export, health visibility, feedback framework, release notes, and production verification.

## Scope

Included:

- Workspace dashboard polish and clearer Beta entry points.
- Workspace Morning Brief copy / Markdown export / print-friendly view.
- Workspace Health Center at `/my-ixai/health`.
- Beta Readiness Dashboard at `/my-ixai/beta`.
- Feedback template and release notes framework.
- Production QA checklist and docs.

Not included:

- Trading.
- Buy / sell / hold recommendations.
- Target prices.
- Broker integration or automated execution.
- AI model calls.
- Auth, RLS, schema, migration, or billing changes.
- Scheduler, push, LINE, Telegram, or email delivery activation.
- External feedback service integration.

## Workspace Polish

Workspace Home now includes V14 Beta Preview and Health Center entry points. The Beta and Health views keep clear empty / pending states and manual refresh behavior so Settings and Copilot do not regain heavy mount-time work.

Workspace routes continue to show source status, data quality, and monitoring-only boundaries. V14 Sprint 3 does not add new investment calculations.

## Brief Share / Export

Workspace Morning Brief now includes:

- Copy Brief.
- Export Markdown.
- Print Friendly View.
- Share-ready text block.

The export helper lives under `src/lib/workspace/morning-brief/brief-export.ts`.

Export policy:

- No automatic send.
- No LINE / Telegram / email integration.
- No external service.
- No investment recommendation language.
- No sensitive account token or identity data.

## Health Center

The Workspace Health Center is available at:

```text
/my-ixai/health
```

It displays:

- Yahoo status through the internal live quote API route.
- Binance status through the internal live quote API route.
- Quote cache status awareness.
- Portfolio valuation readiness.
- FCN live risk readiness.
- Morning Brief readiness.
- Runtime safety status.
- Data quality summary.
- i18n foundation status.

The Health Center is read-only and uses a manual refresh button. It does not directly fetch external providers in the browser.

## Beta Readiness Dashboard

The Beta Readiness Dashboard is available at:

```text
/my-ixai/beta
```

Checklist items:

- Runtime stable.
- Live Market Data.
- Portfolio valuation.
- FCN live risk.
- Workspace Intelligence.
- Morning Brief.
- Timeline.
- Copilot explain-only summary.
- i18n foundation.
- Mobile QA.
- Production smoke.
- Known limitations documented.

Statuses:

- `ready`
- `partial`
- `blocked`
- `not started`

Beta remains invite-only later and is not public yet.

## Feedback / Release Notes Framework

The feedback framework is a lightweight local entry:

- Copy feedback template.
- Static release notes panel.
- V14 Beta Preview label.
- No external feedback service.
- No email send.
- No database write.

See `docs/V14_BETA_RELEASE_NOTES.md`.

## Production Verification Checklist

Required local validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Production-like smoke:

- `rm -rf .next`
- `npm run build`
- `PORT=3001 npm run start`

Manual route smoke:

- `/my-ixai/home`
- `/my-ixai/intelligence`
- `/my-ixai/copilot`
- `/my-ixai/timeline`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/portfolio`
- `/my-ixai/settings`
- `/my-ixai/health`
- `/my-ixai/beta`

Check:

- No white screen.
- No `RESULT_CODE_HUNG`.
- No repeated 401 / 404 / provider storm.
- Copy Brief works.
- Markdown export works.
- Print view works.
- Health Center loads.
- Beta dashboard loads.
- Feedback / release notes visible.

## Compliance Boundaries

IXAI remains:

- Not a broker.
- Not a trading bot.
- Not a robo-advisor.
- Not a signal-selling product.

Sprint 3 does not add:

- Buy / sell / hold recommendations.
- Target prices.
- Trading signals.
- Automated execution.
- Broker integration.
- AI model calls.
- Product suitability advice.
- Scheduled or pushed delivery.

## Out of Scope

- Public Beta launch.
- Full content translation.
- Broker integration.
- Trading or recommendation features.
- Scheduler / notification delivery activation.
- External feedback storage.
- Supabase schema, migration, RLS, auth, membership, or billing changes.

## Known Limitations

- V14 Beta Preview still requires production verification before inviting users.
- Live quote coverage is intentionally narrow.
- FCN valuation remains notional placeholder, not a full pricing engine.
- Health Center provider probes use only the internal live quote route.
- Feedback is a copied template only and is not stored by IXAI.
- V13.0 is foundation-only; full localization resumes after V14.

## Next Step After V14

After V14 Sprint 3 production verification, return to the V13 i18n track:

- V13.1 Dictionary Migration.
- V13.2 Translation Packs.
- V13.3 Region.
- V13.4 Currency.
- V13.5 Localization.
