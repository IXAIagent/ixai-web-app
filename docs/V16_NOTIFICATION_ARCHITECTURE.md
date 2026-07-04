# V16 Notification Architecture

This document defines the notification architecture gate before V16 notification implementation.

V16 notification must not be built as a direct Telegram or LINE integration.

## 1. Core Principle

Notification is an output of AI Monitoring, not a standalone broadcast feature.

Every notification must answer:

```text
Why does this matter to my investments?
這件事為什麼跟我的投資有關？
```

## 2. Channel Router Architecture

V16 notification architecture:

```text
AI Monitoring Engine
↓
Notification Engine
↓
Channel Router
↓
Telegram / LINE / Email / In-App / Browser Push / Mobile Push
```

Telegram is the first usable external channel.

LINE may have been planned or may exist as traces in the codebase, but it must be audited before implementation.

Future channels must be added behind the Channel Router without rewriting monitoring logic.

## 3. Provider Independence

No notification channel may be hard-bound to the monitoring engine.

Channel support must be abstract enough to support:

- Telegram.
- LINE.
- Email.
- In-App.
- Browser Push.
- iOS Push.
- Android Push.

## 4. Failure Degradation

Provider failure must degrade delivery, not crash monitoring.

中文：

```text
外部來源失敗，只能讓內容降級，不能讓產品停擺。
```

Examples:

- Telegram failure -> keep in-app alert.
- LINE failure -> fallback to Telegram / Email / In-App.
- Email failure -> keep in-app alert and retry later if supported.
- Browser Push unavailable -> keep notification inside Workspace.
- Mobile Push unavailable -> keep notification inside Workspace.

## 5. AI Monitoring Event Matrix

V16 notification must define an event matrix before implementation.

Initial event examples:

- FCN KI distance < 10%.
- FCN observation tomorrow.
- FCN coupon upcoming.
- Underlying earnings tonight.
- Stock single-day move > threshold.
- Crypto volatility spike.
- BTC / ETH major move.
- Macro event: Fed / CPI / war / oil.
- News affects held asset.
- News affects FCN underlying.

Each event must specify:

- Trigger condition.
- Affected asset.
- Affected Portfolio or FCN.
- User-facing explanation.
- Priority.
- Allowed channels.
- Fallback channel.
- Suppression / duplicate rule.

## 6. Notification / Integration Audit

Before V16 notification coding, audit:

- Telegram.
- LINE.
- Email.
- In-App.
- Browser Push.
- iOS Push.
- Android Push.

For each channel, confirm:

- Existing UI.
- Existing API.
- Existing webhook.
- Existing environment variables.
- Production usability.
- Placeholder-only status.

## 7. Out of Scope

This document does not authorize:

- Trading.
- Recommendation logic.
- Buy / sell / hold alerts.
- Billing.
- New DB schema.
- Provider-specific implementation before audit.
