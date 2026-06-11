# Global Market Foundation Review v2.10a

## Goal

v2.10a is a docs-first architecture review after the Portfolio Core Foundation chain reached:

```text
Valuation
→ Exposure
→ Concentration
→ Correlation
→ Scenario
→ Stress Test
→ FCN Risk
```

This release does not add a new engine, UI redesign, migration, schema change, API change, auth change, membership change, entitlement change, broker sync, market data provider, external AI provider, or trading logic.

The review validates whether IXAI is ready for:

- Global Markets.
- Global FCN Products.
- Multi-Language.
- Multi-Broker.
- Legacy Pro Migration.
- Future Real Market Data.

## Portfolio Core Foundation Completion Review

Completed foundations:

- v2.00 Intelligence Engine.
- v2.01 Risk Engine.
- v2.02 Recommendation Engine.
- v2.03 Market Data Foundation.
- v2.04 Valuation Engine.
- v2.05 Exposure Engine.
- v2.06 Concentration Engine.
- v2.07 Correlation Engine.
- v2.08 Scenario Engine.
- v2.09 Stress Test Engine.
- v2.10 FCN Risk Engine.

### Architecture Consistency

Status: Ready.

The portfolio core now follows a consistent foundation pattern:

- Type definitions.
- Engine contract.
- Deterministic mock engine.
- Builder function.
- Portfolio Center readback.
- Architecture Map update.
- Release documentation.

This pattern is now stable enough to use as the default architecture for future foundation layers.

### Engine Dependency Chain

Status: Ready.

Current chain:

```text
Repository
→ Intelligence Universe
→ News Provider
→ AI Commentary
→ Intelligence Engine
→ Risk Engine
→ Recommendation Engine
→ Market Data
→ Valuation
→ Exposure
→ Concentration
→ Correlation
→ Scenario
→ Stress Test
→ FCN Risk
```

The chain is additive. No engine should mutate upstream data. Each builder receives prior reports and returns a new report.

### Builder Structure

Status: Ready.

Builders now function as the integration seam between UI and engines. This is the right place to swap mock engines for provider-backed engines later.

Future rule:

- Do not let UI components call mock engines directly.
- Do not duplicate upstream logic in downstream builders.
- Do not bypass Repository / Provider / Builder boundaries.

### Provider Structure

Status: Partially Ready.

Ready:

- Repository provider abstraction exists.
- Mock news provider exists.
- Mock market data provider exists.
- Mock commentary provider exists.

Partially ready:

- Provider governance, freshness, attribution, vendor limits, fallback behavior, and failure modes are not yet formalized.

Not ready:

- Real market data providers.
- Real news providers.
- Broker providers.
- AI providers.

### Dashboard Integration

Status: Partially Ready.

Ready:

- `/my-ixai/portfolio` can display the full foundation chain.
- Mobile-first responsive cards are used instead of tables.
- Compliance copy is present across engine sections.

Partially ready:

- Portfolio Center is becoming too dense.
- The dashboard now mixes portfolio overview, architecture, data model status, repository status, ownership validation, news, commentary, intelligence, risk, recommendation, market data, valuation, exposure, concentration, correlation, scenario, stress test, and FCN risk.

This should trigger v2.11 Platform IA Refactor before more features are added.

## Global Market Compatibility Review

| Market / Product | Status | Notes |
| --- | --- | --- |
| US Equities | Ready | Current mock symbols and examples are strongest here. |
| TW Equities | Partially Ready | Region enum exists, but symbol conventions, providers, localization, and exchange context need review. |
| HK Equities | Partially Ready | Region readiness exists; provider and symbol normalization still need design. |
| CN A-Shares | Partially Ready | Region readiness exists; exchange suffixes, currency, and market calendar need design. |
| JP Equities | Partially Ready | Region readiness exists; yen handling and symbol format need design. |
| KR Equities | Partially Ready | Region readiness exists; Korean localization and provider mapping need design. |
| EU Equities | Partially Ready | Region readiness exists; country / exchange sub-regions need design. |
| SG Equities | Partially Ready | Strategic direction exists; region enum currently needs explicit SG review before provider work. |
| Crypto | Ready for foundation | Crypto / Grid / Dual categories exist; real exchange sync is not connected. |
| FCN | Ready for foundation | FCN assets and underlyings are supported through category and metadata. |
| Structured Products | Partially Ready | FCN is first structured-product wedge; broader product types need future modeling. |

Summary:

- The foundation is market-agnostic in principle.
- The strongest current readiness is US / Crypto / FCN foundation.
- TW / HK / CN / JP / KR / EU / SG need provider, symbol, currency, calendar, and localization review before real data integration.

## FCN Global Expansion Review

The current FCN architecture does not hard-code US-only behavior in the v2.10 Portfolio FCN Risk Engine.

FCN identification:

- `category === "FCN"`.
- `metadata.underlyings`.

This supports future underlyings from:

- Taiwan FCN.
- Hong Kong FCN.
- China FCN.
- Japan FCN.
- Korea FCN.
- Europe FCN.
- Crypto-linked FCN.
- Global indexes.
- Future structured products.

Status:

- Global FCN metadata foundation: Ready.
- Global FCN pricing / market data: Not Ready.
- Global FCN issuer / terms model: Partially Ready.
- KI / KO / observation / coupon production engine: Not Ready.
- Real FCN account sync: Not Ready.

Future requirement:

- FCN engines must preserve region, currency, issuer, underlying market, and product terms.
- FCN risk output must remain monitoring and risk-awareness, not product recommendation.

## Multi-Language Readiness Review

Current production language:

- `zh-TW`.

Future strategic languages:

- `zh-CN`.
- `en-US`.
- `ja-JP`.
- `ko-KR`.

Future expansion:

- `en-GB`.
- French.
- German.

Review:

- UI labels: Partially Ready. Chinese UI exists, but many engine outputs are English mock text.
- Engine outputs: Partially Ready. Engine summaries are deterministic English-first text and should eventually use localization keys.
- Dashboard text: Partially Ready. Portfolio Center mixes Chinese headings with English technical labels.
- Compliance text: Partially Ready. Compliance language exists but should be centralized before multi-language release.

Recommendation:

- v2.11 IA should not introduce a full i18n system yet.
- v2.12+ should define localization-ready copy contracts before global launch.
- Engine reports should separate structured fields from display copy so localized renderers can translate safely.

## Multi-Broker Readiness Review

Future providers:

- Binance.
- IBKR.
- Firstrade.
- Futu.
- CTBC.
- Fubon.
- Yuanta.
- Future Bank Custody.

Review:

- Provider abstraction: Partially Ready. Provider enums and repository patterns exist, but real providers are not connected.
- Asset ownership model: Ready for foundation. Repository and Supabase ownership boundaries exist.
- Portfolio repository design: Ready for foundation. The repository boundary is the right seam for broker sync later.
- Broker sync governance: Not Ready. Credential handling, token storage, provider permissions, failure modes, and user consent must be designed.

Recommendation:

- Do not connect a broker API before v2.12 Broker Integration Foundation.
- Broker sync must go through server-side provider adapters, not client-side API calls.
- Broker data must preserve user ownership, account provider, region, currency, and imported position provenance.

## Legacy Pro Migration Review

Already migrated or recreated in App-native foundation:

- Portfolio foundation.
- FCN foundation.
- Risk readback foundations.
- Portfolio dashboard readback.
- Repository / persistence boundary.
- Basic membership / entitlement foundation.

Partially migrated:

- Portfolio Intelligence.
- FCN Monitoring.
- Risk workflows.
- Client reporting concepts.
- Asset allocation and exposure concepts.

Not migrated:

- Legacy JWT login.
- `localStorage` session model.
- Direct browser-to-FastAPI protected calls.
- Legacy AppShell.
- Full client report export workflow.
- Backend portfolio / FCN production sync.
- Real broker integrations.

Expected future migration:

- News.
- AI Commentary.
- Risk.
- Portfolio Intelligence.
- FCN Monitoring.
- Client Reporting.

Migration principle:

- Reuse product concepts and selected UI patterns.
- Do not migrate legacy auth architecture wholesale.
- Build future Pro workflows inside `app/ixai-web-app`.

## Portfolio Center Complexity Review

Portfolio Center currently contains too many layers for one page.

### Keep In Portfolio Center

- Portfolio Overview.
- Portfolio Health / Status.
- Asset Allocation.
- Portfolio Dashboard Foundation.
- Ownership / Persistence Status, while still in validation stage.
- High-level engine summaries.

### Move To Risk Center

- Risk Engine.
- Stress Test Engine.
- Scenario Engine.
- Correlation Engine.
- Concentration Engine.
- FCN Risk Engine summary, with deep detail in FCN Center.

### Move To Intelligence Center

- News Feed.
- AI Commentary.
- Intelligence Engine.
- Recommendation prompts, if framed as monitoring prompts.

### Move To FCN Center

- FCN Risk Engine.
- FCN underlyings.
- Worst-of.
- KI / KO.
- Observation calendar.
- Coupon calendar.

### Move To Settings

- Membership Status.
- Entitlements.
- Repository / persistence source diagnostics after validation.
- Account linking.
- Provider connection status.

### Future

- Broker Sync Center.
- Market Data Provider Center.
- Localization / Language Settings.
- Client Reporting Center.

## Platform IA Refactor Proposal for v2.11

Recommended IA:

```text
Home
Portfolio Center
Risk Center
Intelligence Center
FCN Center
Settings
```

### Home

Purpose:

- User-level landing after login.
- Show portfolio health, key alerts, next actions, and recent intelligence.

Navigation:

- Entry point to Portfolio, Risk, Intelligence, FCN, Settings.

Migration impact:

- Pull high-level highlights from the current Portfolio Center.

### Portfolio Center

Purpose:

- Asset inventory, allocation, valuation, exposure, repository status.

Navigation:

- Portfolio overview.
- Assets.
- Allocation.
- Valuation.
- Exposure.

Migration impact:

- Keep current Portfolio sections that describe holdings and portfolio structure.

### Risk Center

Purpose:

- Concentration, correlation, scenario, stress test, risk score.

Navigation:

- Risk overview.
- Concentration.
- Correlation.
- Scenario.
- Stress Test.

Migration impact:

- Move risk-heavy sections out of Portfolio Center.

### Intelligence Center

Purpose:

- News universe, news feed, commentary, intelligence score, monitoring prompts.

Navigation:

- Tracked symbols.
- News.
- Commentary.
- Intelligence summary.

Migration impact:

- Move news / commentary / intelligence sections out of Portfolio Center.

### FCN Center

Purpose:

- FCN positions, underlyings, worst-of, KI / KO, FCN risk.

Navigation:

- FCN overview.
- Underlyings.
- Risk.
- Terms.
- Future calendar.

Migration impact:

- Move FCN-specific readback from Portfolio Center into a dedicated center.

### Settings

Purpose:

- Account, membership, entitlement, provider, language, notification settings.

Navigation:

- Account.
- Membership.
- Entitlements.
- Providers.
- Language.

Migration impact:

- Move membership / entitlement / diagnostics out of primary dashboard.

## Production Readiness Assessment

| Area | Readiness | Notes |
| --- | ---: | --- |
| Portfolio Foundation | 82% | Production persistence exists, but full CRUD persistence and import workflows are incomplete. |
| Risk Foundation | 68% | Deterministic risk, concentration, correlation, scenario, stress, and FCN risk foundations exist; real data validation is not active. |
| Global Market Foundation | 55% | Principles and enums exist; provider, symbol, calendar, and localization contracts need review. |
| Broker Foundation | 25% | Provider concepts exist; no broker sync, credential model, or consent workflow. |
| Market Data Foundation | 35% | Mock provider and snapshot contract exist; no real providers or freshness governance. |
| Legacy Pro Migration | 40% | Concepts are being rebuilt app-native; auth/session and backend workflows remain separate. |
| Overall IXAI Platform | 62% | Strong architecture foundation, but IA split, real data governance, localization, and broker readiness must come before platform beta. |

## Go / No-Go

Go:

- Proceed to v2.11 Platform IA Refactor.
- Continue with docs-first architecture cleanup.
- Keep engines deterministic until real provider governance exists.

No-Go:

- Do not add more dashboard engine sections to Portfolio Center before IA refactor.
- Do not connect broker sync before provider governance and consent design.
- Do not connect real market data before freshness, attribution, and fallback rules.
- Do not migrate Legacy Pro auth patterns into the App.

## Validation Checklist

Required for this docs-first release:

- `git diff --check`.
- `npm run lint`.
- `npm run build`.
- `QA_PORT=3001 npm run qa:mobile`.
- Playwright checks for `/portfolio` and `/my-ixai/portfolio` at 375 / 768 / 1280.
- No migration.
- No schema change.
- No API change.
- No UI redesign.
