# IXAI v1.40.2b — UX Cohesion Pass

This pass aligns the new landing, onboarding, intelligence preview, account, LINE, and Pro surfaces into one product narrative.

## Why Cohesion Matters

After v1.40.0, v1.40.1, and v1.40.2a, IXAI had the right building blocks:

- public landing
- onboarding
- intelligence delivery foundation
- Pro preview
- Pro intelligence shell
- account / identity surfaces
- LINE intelligence entry

The risk was that these could feel like separate pages rather than one AI-native investment intelligence product.

v1.40.2b tightens language, CTA hierarchy, and visual rhythm so users can understand the journey:

```text
Public Landing
→ Intelligence Preview
→ Onboarding
→ AI Intelligence Workspace
→ Future Pro Intelligence
```

## Public → Preview → Pro Narrative

The narrative now distinguishes:

- Public: generalized market context, Daily / Weekly Intelligence, FCN awareness.
- Preview: sample intelligence, Watchlist memory, delivery preferences, LINE intelligence entry.
- Pro: future personalized portfolio relevance, FCN risk intelligence, AI alerts, and personal market memory.

The goal is clarity without implying paid Pro access is already live.

## CTA Language System

Preferred CTA language:

- 建立 Intelligence Layer
- 查看 Intelligence Preview
- 開始 Onboarding
- 連接 LINE 接收情報
- 開啟 AI Intelligence Workspace

Avoid generic SaaS language such as:

- login
- dashboard
- shell
- generic account tool wording

Exceptions are allowed only where auth-specific flows require precise wording.

## LINE Intelligence Language

LINE is separated into two meanings:

- LINE Consultation: public communication / contact channel.
- LINE Intelligence: future opt-in intelligence delivery layer.

User-facing text should not imply that push delivery is live before opt-in persistence, queueing, logs, and unsubscribe controls exist.

## UX Consistency Philosophy

IXAI should feel:

- institutional
- calm
- intelligence-first
- mobile-safe
- premium without aggressive paywall language

Design should avoid:

- noisy marketing banners
- crypto-casino styling
- low-contrast icons
- generic dashboard wording
- over-promising automation

## Analytics

v1.40.2b adds cohesion-level events:

- `ux_cohesion_preview_view`
- `intelligence_workspace_cta_click`
- `line_intelligence_cta_click`
- `pro_preview_flow_view`

These events must not send raw identity, watchlist symbols, LINE user IDs, or tokens.

## Future Follow-Up

Future cleanup should consider extracting shared CTA and section primitives for public / preview / Pro surfaces once the language stabilizes.
