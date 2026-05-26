# LINE Identity Merge — v1.39.0

IXAI now has the first foundation for a unified intelligence identity across:

- lightweight IXAI identity session
- distribution subscriber profile
- membership record
- LINE identity bridge

This phase does not implement a chatbot, push marketing, LIFF, or LINE Login. It creates the merge contract that lets those features land later without changing the public identity model again.

## Why Merge Before Push

Financial intelligence delivery must know who the recipient is before sending anything. IXAI therefore starts with identity continuity instead of automation:

1. A reader creates a lightweight IXAI identity session with email.
2. IXAI resolves subscriber and membership state.
3. The LINE connect surface creates a pending link contract.
4. A future LINE Login / LIFF flow can complete the link with a verified LINE user id.
5. Only after explicit opt-in should IXAI send Daily Brief, risk alerts, FCN threshold alerts, or Pro intelligence delivery.

## Current Architecture

`src/lib/line/config.ts`

- Reads LINE env safely.
- Returns booleans only.
- Never logs or exposes channel secrets or access tokens.

`src/lib/line/identity-merge.ts`

- Resolves identity session, subscriber, membership, and LINE bridge record into one deterministic model.
- Provides idempotent helpers for future LINE link completion.
- Creates a short-lived pending link state for the current MVP connect contract.

`POST /api/line/connect`

- Requires an existing IXAI identity session.
- Does not perform OAuth.
- Does not directly link a LINE user id.
- Returns safe connect metadata and LINE OA URL when configured.

## Session ↔ LINE Merge Lifecycle

Current state:

- `ixai_identity` remains the existing signed httpOnly cookie.
- `/api/auth/me` enriches the response with `line_connected`, `unified_identity`, and `intelligence_sync_ready`.
- `components/line/connect-line-card.tsx` shows the user whether LINE sync is not connected, pending, or ready.

Future completion path:

- LINE Login / LIFF returns a verified LINE user id.
- Server validates LINE signature / OAuth state.
- Server calls `linkLineIdentity()` with the verified `lineUserId`.
- Subscriber profile receives the `line_connected` tag.
- `/api/auth/me` resolves the connected state on the next refresh.

## Future LINE Login / LIFF Path

The current pending link token is intentionally not a final auth mechanism. A production LINE flow should add:

- OAuth state validation
- PKCE or signed nonce validation
- LIFF profile resolution
- webhook signature verification for Messaging API events
- durable pending link storage if cross-region completion is required

## Future Intelligence Push Path

Notifications must remain opt-in and should be separated by category:

- Daily Brief published
- Market risk alert
- FCN threshold alert
- Watchlist movement
- IXAI Pro monitoring alert

No current surface sends push messages. The UI copy says "future alerts" only.

## Required Environment

- `NEXT_PUBLIC_LINE_OA_URL` for the public LINE Official Account link.
- `IXAI_LINE_LINK_SECRET` for the existing server-side LINE bridge endpoint.
- `LINE_CHANNEL_ID` and `LINE_CHANNEL_SECRET` for future LINE Login / LIFF.
- `LINE_CHANNEL_ACCESS_TOKEN` for future Messaging API integration.

Do not expose channel secret or access token in client components.
