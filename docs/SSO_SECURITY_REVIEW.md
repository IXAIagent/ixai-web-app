# IXAI SSO Security Review

Version: `v1.61.1`

Purpose: review the security model for future App to Pro SSO before implementation.

Status: design review only. No production auth behavior changes in this version.

## A. Security Verdict

Security verdict: GO with controls.

Unified Supabase Auth is viable if backend validates Supabase-issued JWTs directly and treats the backend account-link / membership / entitlement layer as authorization, not authentication. Legacy Pro must stop treating a locally stored backend JWT as the only source of authenticated state before true SSO can be called complete.

## B. Identity Trust Model

Target model:

```text
Authentication source of truth: Supabase Auth
Identity claim: Supabase JWT sub
Product ownership: backend account linked to provider=supabase + external_user_id
Authorization: backend membership + entitlements
UI state: derived from backend authorization, never authoritative
```

Important distinction:

- Supabase proves who the user is.
- Backend account link decides which backend account the user owns.
- Membership / entitlements decide what the user can access.
- App or Legacy Pro UI must not grant Portfolio / FCN / Risk access by label alone.

## C. Critical Risks

### 1. Trusting Browser-Supplied User IDs

Risk:

- A browser could send an arbitrary `external_user_id` if backend endpoints do not validate Supabase JWTs.

Mitigation:

- Backend must derive user identity from a verified JWT `sub`, not from request body identity fields.
- Keep request-body `external_user_id` only for trusted server-to-server account-link calls, or require signed internal requests.

### 2. Token Leakage Through URLs

Risk:

- Passing access tokens in query strings can leak through browser history, logs, analytics, referrers, and screenshots.

Mitigation:

- Never place Supabase access tokens or refresh tokens in URLs.
- If fallback bridge is required, use one-time launch codes with short TTL, nonce, audience, and immediate redemption.

### 3. Persistent Legacy LocalStorage JWT

Risk:

- Legacy Pro currently stores `ixai_token` in `localStorage`, which is exposed to XSS.

Mitigation:

- During SSO migration, reduce or remove reliance on `ixai_token` as primary session source.
- Prefer Supabase-managed session lifecycle or short-lived bridge tokens.
- Add Content Security Policy hardening before removing legacy login.

### 4. Backend Entitlement Bypass

Risk:

- If Legacy Pro only checks UI state, users could call backend APIs directly.

Mitigation:

- Backend must enforce account-link and entitlement checks on protected Portfolio / FCN / Risk endpoints.
- Frontend feature gates are UX only.

## D. High Risks

### Supabase JWT Validation Misconfiguration

Risk:

- Backend may accept the wrong issuer, audience, signing key, or expired token.

Mitigation:

- Validate signature, issuer, audience, expiration, and token type.
- Use the Supabase JWT signing key / JWKS strategy appropriate to the project.
- Fail closed when keys cannot be loaded.

### Logout Desynchronization

Risk:

- App logout may not clear Legacy Pro session, leaving Pro apparently logged in.

Mitigation:

- Define logout propagation in v1.63+.
- Legacy Pro must clear its own session state when App session is absent or invalid.
- Backend should reject expired / revoked tokens even if Legacy Pro UI still holds stale state.

### Replay of Bridge Tokens

Risk:

- If Option B is used, a launch token could be replayed.

Mitigation:

- Use one-time codes, short TTL, nonce, audience, and redemption tracking.
- Never issue long-lived bridge tokens.

### Mixed Identity Accounts

Risk:

- A legacy Pro user and an App user with the same email may not be the same person.

Mitigation:

- Use Supabase `sub` as the durable external identity.
- Do not merge accounts by email alone without manual review or explicit linking.

## E. Medium Risks

- CORS set too broadly for backend protected endpoints.
- Token or email logging in backend request logs.
- Legacy register page creating duplicate backend users after SSO starts.
- Supabase session refresh behavior differing between App and Legacy Pro.
- Users with assigned Legacy Pro credentials confused by App-first login.

## F. Recommended Mitigations

- Keep v1.62 behind explicit beta / feature flag.
- Add backend tests for invalid issuer, expired token, missing `sub`, wrong audience, and revoked / unlinked account.
- Add QA that verifies App logout invalidates or blocks Pro access.
- Keep Legacy Pro login available as rollback until v1.65.
- Keep entitlements server-authoritative.
- Never expose service role keys, backend secrets, refresh tokens, or full Authorization headers in responses or logs.
- Do not implement Stripe / paid authorization until identity and entitlement enforcement are stable.

## G. Security Checklist For v1.62

- [ ] Backend validates Supabase access token before trusting user identity.
- [ ] No Supabase access token appears in URL query parameters.
- [ ] No refresh token is forwarded to backend.
- [ ] Account-link lookup uses `provider=supabase` and verified `sub`.
- [ ] Entitlement checks remain backend-side.
- [ ] Legacy Pro fallback login still works.
- [ ] Logout behavior is documented even if not fully unified.
- [ ] Debug endpoints return only non-sensitive booleans / counts.

## H. Reference Notes

Supabase sessions are represented by a short-lived access token in JWT form and a refresh token that supports session refresh. Supabase Auth also uses JWTs as the foundation for authentication and authorization across its ecosystem. Future IXAI backend validation should therefore verify Supabase JWTs rather than inventing a second browser identity source.

