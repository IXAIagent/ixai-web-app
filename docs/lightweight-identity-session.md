# IXAI v1.38.1 Lightweight Identity Session

IXAI uses a lightweight identity session before introducing full shared auth. The goal is to preserve a visitor's subscriber and membership context across visits without adding passwords, social login, Stripe, or a paywall.

## What This Is

- A signed `httpOnly` cookie named `ixai_identity`
- 30-day session lifetime
- Email-normalized identity context
- Membership plan/status lookup
- Pro candidate and LINE connection flags for future continuity

## What This Is Not

- It is not Supabase Auth replacement
- It is not a password login system
- It is not a payment entitlement system
- It is not a shared Public / Pro account yet

## Session Lifecycle

1. User enters email on a Pro identity surface.
2. `/api/auth/session` normalizes the email.
3. IXAI looks up subscriber and membership records.
4. If membership does not exist, IXAI creates a free active membership.
5. Server signs the identity payload and stores it in an `httpOnly` cookie.
6. `/api/auth/me` restores the identity context on page load.
7. `/api/auth/logout` clears the cookie.

## Security Notes

- The cookie is signed server-side.
- The cookie is `httpOnly`, `sameSite=lax`, and `secure` in production.
- Client code never receives the raw signed token.
- Analytics events do not include raw email.
- Service worker excludes `/api/auth/*`, `/auth`, `/login`, `/register`, and `/account`.

Recommended production environment variable:

```bash
IXAI_IDENTITY_SECRET=strong-random-secret
```

If `IXAI_IDENTITY_SECRET` is absent, the server falls back to existing server-only secrets. Local development uses a non-production fallback.

## Future LINE Merge

The session model includes `line_connected` so LINE Login / LIFF identity can be merged later without changing the UI contract. The current value is conservative and defaults to `false` unless a later identity merge confirms linkage.

## Future Stripe Merge

Membership fields are intentionally separate from payment state. Stripe can later update `ixai_memberships`, and the same session restoration path can render Pro / Enterprise access states.

## Identity Graph Strategy

This layer bridges:

- anonymous analytics
- subscriber capture
- membership readiness
- Pro waitlist intent
- future LINE identity
- future Stripe entitlement

It keeps IXAI lightweight now while preserving a path toward a shared Public App + Pro workspace identity.
