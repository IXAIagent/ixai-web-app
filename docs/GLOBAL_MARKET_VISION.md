# IXAI Global Market Vision

This document defines the global market principle that should guide future IXAI portfolio, FCN, risk, intelligence, localization, and provider architecture.

## IXAI Global Market Principle

IXAI is designed as a:

```text
Global Multi-Asset
Multi-Broker
Multi-Market
AI Risk Platform
```

IXAI should not be treated as a US-only, Taiwan-only, English-only, or single-broker system. Every major portfolio, risk, market data, news, and language interface should be designed with global expansion in mind, even when the first implementation uses deterministic mock data or a narrow MVP dataset.

v2.10a adds the first formal Global Market Foundation Review. See `docs/GLOBAL_MARKET_FOUNDATION_REVIEW_V210A.md` before changing portfolio engine assumptions, FCN underlying assumptions, region / provider enums, market data interfaces, news interfaces, localization surfaces, broker readiness, or Legacy Pro migration boundaries.

## Supported Markets

Strategic direction:

- US Equities.
- Taiwan Equities.
- Hong Kong Equities.
- China A-Shares.
- Japan Equities.
- Korea Equities.
- European Equities.
- Singapore Equities.
- Crypto Assets.
- FCN Structured Products.

These markets represent product direction, not a claim that all data providers, broker integrations, or real-time feeds are active today.

## Supported Languages

Strategic direction:

- Traditional Chinese (`zh-TW`).
- Simplified Chinese (`zh-CN`).
- English (`en-US`).
- Japanese (`ja-JP`).
- Korean (`ko-KR`).

Future-ready:

- English (`en-GB`).
- French.
- German.

Language support should be treated as a product architecture requirement, not a late visual translation layer.

V13.0 implementation note:

- The first i18n foundation is now shared by the Public App and Workspace.
- Supported runtime locales are `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR`.
- The shared locale state uses `ixai.locale` in localStorage and cookie.
- Public users can change language without registration.
- Workspace Settings manages the same locale state.
- This is foundation-only and does not translate full market content, Daily / Weekly articles, Portfolio / FCN / Risk data, symbols, tickers, or admin editorial content.
- No Supabase preference sync, auth/RLS/schema/migration, billing, broker, trading, recommendation, scheduler, OpenAI, or AI behavior is enabled by this foundation.

V14.0 Live Workspace planning note:

- V14 becomes the active product mainline after V13.0 foundation.
- Live market data, portfolio valuation, FCN live risk, Workspace Intelligence, and Morning Brief work must remain global-market-ready.
- V14 live data work must not assume US-only equities, English-only content, or single-provider availability.
- Provider health, fallback, currency, market, region, and source-quality labels should be designed so future Taiwan, Hong Kong, China, Japan, Korea, Europe, Singapore, crypto, and FCN structured-product coverage can fit without rewrites.
- V14.0 is docs-only planning and does not implement live providers, broker integration, trading, recommendation, AI model calls, scheduler delivery, auth/RLS/schema/migration, or billing changes.

V14 Sprint 1 implementation note:

- Initial live provider coverage is intentionally narrow: Yahoo Finance for supported US equity symbols and Binance for BTC / ETH / BNB USDT pairs.
- This is the first provider layer, not full global market coverage.
- The live market architecture must remain ready for future Taiwan, Hong Kong, China, Japan, Korea, Europe, Singapore, crypto, and FCN structured-product coverage.
- Provider failures must show source quality and fallback status rather than blocking Workspace routes.

## Architecture Principle

All engines must be market-agnostic, including:

- Valuation Engine.
- Exposure Engine.
- Concentration Engine.
- Correlation Engine.
- Scenario Engine.
- Stress Test Engine.
- FCN Risk Engine.
- Future Engines.

Engines should not assume:

- US-only.
- Taiwan-only.
- English-only.

Data models should preserve region, market, provider, currency, language, and symbol context whenever possible.

## FCN Principle

FCN underlyings may originate from:

- United States.
- Hong Kong.
- China.
- Japan.
- Korea.
- Europe.
- Global Indexes.
- Future Markets.

IXAI FCN engines must support global underlyings. FCN risk, worst-of, KI / KO, exposure, concentration, correlation, scenario, and future stress-test logic should not assume that all underlyings are US equities.

v2.10 Portfolio FCN Risk Engine Foundation extends this principle to portfolio-level FCN readback. FCN risk scoring must recognize underlyings across US, Taiwan, Hong Kong, China A-Shares, Japan, Korea, Europe, Singapore, crypto-linked FCN, global indexes, and future structured products.

## Roadmap Implication

The roadmap should include:

```text
v2.10a — Global Market Foundation Review
```

Purpose:

- Review all Portfolio Foundation engines for global market compatibility.
- Review Asset Types.
- Review Region Enums.
- Review Provider Enums.
- Review Market Data Interfaces.
- Review News Interfaces.
- Review Language Interfaces.
- Review Localization Readiness.
- Review FCN support beyond US equities.
- Review future support for TW / HK / CN / JP / KR / EU / SG.
- Review crypto-linked structured products.
- Review future broker integration compatibility.

v2.10a outcome:

- Proceed to v2.11 Platform IA Refactor before adding more Portfolio Center modules.
- Keep engines market-agnostic.
- Do not connect real market data or broker sync until provider governance exists.
- Do not migrate Legacy Pro auth/session architecture into the App.

## Compliance Boundary

Global market support does not change IXAI's compliance posture.

IXAI remains:

- Monitoring and risk-awareness oriented.
- Not a broker.
- Not a trading execution system.
- Not a personalized buy / sell recommendation system.
- Not a guaranteed-return or signal-selling product.
