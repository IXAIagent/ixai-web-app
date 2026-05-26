# LINE Login + LIFF Foundation — v1.39.1

IXAI now has a lightweight LINE Login and LIFF foundation. This is an identity entry layer, not a chatbot, broadcast engine, or push automation system.

## Architecture

Core files:

- `src/lib/line/config.ts` reads LINE env safely and exposes readiness booleans.
- `src/lib/line/login.ts` builds LINE Login URLs, validates state cookies, exchanges callback codes, restores a lightweight IXAI identity session, and merges LINE identity.
- `src/lib/line/liff.ts` exposes client-safe LIFF readiness config.
- `/api/line/login` starts the LINE Login redirect.
- `/api/line/callback` restores the unified identity and redirects back to `/pro-preview`.
- `/liff` is the mobile entry shell for LINE in-app browser / future LIFF usage.

## Login Flow

1. User clicks `使用 LINE 繼續`.
2. `/api/line/login` creates a short-lived signed state cookie.
3. User is redirected to LINE Login.
4. LINE redirects to `/api/line/callback`.
5. Callback validates state, exchanges the code server-side, resolves LINE user id and display name, and links the identity through the existing LINE bridge.
6. IXAI creates the existing signed `ixai_identity` cookie and redirects to `/pro-preview?line_login=success`.

If LINE does not return an email claim, IXAI creates a deterministic internal email alias using a hash of the LINE user id. The raw LINE id is not sent to analytics.

## LIFF Flow

`/liff` is a readiness shell:

- detects whether the page is opened inside a LINE in-app browser
- shows LIFF ID readiness
- offers LINE Login when configured
- displays graceful fallback when env is incomplete

This phase does not import the LIFF SDK or request LIFF profile permissions yet. That will be added once the LINE developer console LIFF app is provisioned.

## Unified Identity Flow

The unified model combines:

- IXAI identity session
- distribution subscriber profile
- membership record
- LINE identity bridge record

`/api/auth/me` now returns:

- `line_user_id`
- `line_display_name`
- `line_connected`
- `liff_ready`
- `line_login_ready`
- `intelligence_sync_ready`
- `unified_identity`

Client analytics never sends raw LINE user id.

## Environment Setup

Required for LINE Login:

```bash
LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=
LINE_LOGIN_REDIRECT_URI=https://app.ixuan.ai/api/line/callback
```

Required for LIFF shell:

```bash
NEXT_PUBLIC_LINE_LIFF_ID=
```

Existing LINE bridge / OA variables:

```bash
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
NEXT_PUBLIC_LINE_OA_URL=
IXAI_LINE_LINK_SECRET=
```

Do not expose `LINE_LOGIN_CHANNEL_SECRET`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, or `IXAI_LINE_LINK_SECRET` to client components.

## Future

Next phases can add:

- LIFF SDK initialization
- LINE Login nonce / id token verification hardening
- durable pending link storage
- webhook signature verification
- opt-in notification preferences
- push intelligence delivery
- Stripe / Pro entitlement merge

No push messages are sent in this phase.
