# V14 Beta Preview Release Notes

## Status

V14 Beta Preview is a readiness milestone, not a public launch. Invite-only testing should begin only after production verification passes.

## Included

- V14.1 Live Market Data through the internal `/api/market/live-quotes` route.
- V14.2 live Portfolio valuation readback.
- V14.3 FCN live risk readback.
- V14.4 Workspace Intelligence cards.
- V14.5 on-demand Workspace Morning Brief.
- V14.6 Beta readiness dashboard and Workspace Health Center.
- Brief Copy / Markdown export / Print Friendly View.
- Feedback template and static release notes framework.

## Not Included

- Trading.
- Broker connection.
- Buy / sell / hold recommendations.
- Target prices.
- AI model calls.
- Automated execution.
- Scheduler, push, LINE, Telegram, or email delivery activation.
- External feedback storage.
- Auth, RLS, schema, migration, membership, or billing changes.

## Known Limitations

- Live quote provider coverage is narrow.
- Health Center provider checks use the internal live quote route only.
- FCN valuation remains notional placeholder and is not a full FCN pricing engine.
- Morning Brief is generated on demand in Workspace and is not delivered.
- Feedback template copy is local-only and not submitted automatically.
- V13 full localization is still pending after V14.

## Verification Required

Before inviting Beta users:

- Run local validation.
- Run production-like smoke.
- Verify production route stability.
- Confirm no white screen, no `RESULT_CODE_HUNG`, and no repeated provider / auth / optional-resource storm.
- Confirm copy/export/print behavior.

## Next Track

After V14 Beta verification, return to:

- V13.1 Dictionary Migration.
- V13.2 Translation Packs.
- V13.3 Region.
- V13.4 Currency.
- V13.5 Localization.
