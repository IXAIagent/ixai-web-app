# v1.70.0 — SSO Stability Validation

## Purpose

v1.70.0 validates the App to Pro SSO path after v1.69.1 without adding new product features.

Target flow:

```text
App login
→ click 開啟 IXAI Pro
→ Legacy Pro dashboard
→ refresh stable
→ route switching stable
→ logout stable
→ invalid / replayed code handled safely
```

This is validation only. It does not change UI, App launch-code behavior, backend, Supabase schema, Daily / Weekly generation, FCN content, providers, Stripe, broker integration, trading, or portfolio engines.

## Current SSO State

The App remains the Supabase Auth surface and exposes `/api/pro/launch`.

Legacy Pro currently supports:

- Legacy FastAPI JWT login through `/login`.
- App SSO handoff through `/sso/receive`.
- Structured local MVP SSO session object under `ixai_sso_session`.
- Compatibility marker under `ixai_token` using `ixai_sso_v2.` prefix.

v1.69.1 fixes the key session persistence regression:

- Existing valid `ixai_sso_v2` sessions are checked before revalidating a one-time code.
- Replayed / already-used launch codes no longer clear a valid SSO session.
- Stale SSO marker cleanup is handled by `getProSession()`.

## Validation Scope

Validate:

1. `ixai_sso_v2` storage persistence.
2. Replayed code behavior.
3. Expired / invalid code behavior.
4. Dashboard refresh behavior.
5. Route switching behavior.
6. Backend 401 behavior under SSO.
7. Logout behavior.
8. Legacy login fallback.

## Pass / Fail Criteria

Pass:

- A valid SSO handoff creates `ixai_sso_session`.
- Refreshing `/dashboard` keeps the user out of `/login` until `expiresAt`.
- `/portfolio`, `/fcn`, `/market`, `/intelligence`, and `/alerts` do not destroy a valid SSO session.
- Backend 401 does not clear a valid SSO session.
- Invalid / reused code shows the fallback page when no valid SSO session exists.
- Invalid / reused code does not clear an already valid SSO session.
- Legacy Pro logout clears both legacy JWT and SSO session.
- App Supabase session is not affected by Legacy Pro logout.

Fail:

- Refreshing `/dashboard` redirects to `/login` while `ixai_sso_session` is valid.
- Replayed code clears a valid SSO session.
- Backend 401 triggers `logout()` for an SSO session.
- `ixai_sso_v2` is sent to FastAPI as an Authorization bearer token.
- Legacy JWT login stops working.

## Manual QA Checklist

Credential-dependent production checklist:

1. Login to App.
2. Go to `https://app.ixuan.ai/pro`.
3. Click `開啟 IXAI Pro`.
4. Confirm Legacy Pro opens `/dashboard`.
5. Refresh `/dashboard`.
6. Confirm still on dashboard, not `/login`.
7. Navigate:
   - `/portfolio`
   - `/fcn`
   - `/market`
   - `/intelligence`
   - `/alerts`
8. Confirm none force logout.
9. Return to App `/account`.
10. Click `開啟 IXAI Pro` again.
11. Confirm Pro opens dashboard without showing login.
12. Open a second browser tab to Legacy Pro `/dashboard`.
13. Confirm session persists.
14. Test invalid code: `/sso/receive?code=invalid`.
15. Confirm fallback page appears when no valid SSO session exists.
16. Logout from Legacy Pro.
17. Confirm user returns to `/login`.
18. Confirm App Supabase session is not logged out.

## Automated / Static Validation

No credential-dependent automation should be added for this version.

Allowed checks:

- Legacy Pro lint.
- Legacy Pro build.
- Legacy Pro `git diff --check`.
- App lint / build / mobile QA because docs changed.
- Static inspection of session helper behavior.

## Bugs Found

The validation audit found no new code issue beyond the v1.69.1 persistence fix already committed in the Legacy Pro repo.

Important release note:

- v1.69.1 must be deployed before production manual QA can truthfully pass.
- Until v1.69.1 is deployed, production may still show the old replay-clears-session behavior.

## Known Limitations

- The SSO session remains a localStorage MVP bridge, not a full Supabase migration.
- `ixai_sso_v2` does not authorize protected backend portfolio / FCN / risk data.
- App / Pro logout synchronization remains deferred.
- The current Legacy Pro route names are `/market`, `/intelligence`, and `/alerts`; product language may refer to future `/market-intelligence` and `/ai-risk-alerts`.
- App launch code storage remains runtime-memory based and is not multi-region durable.

## Recommended Next Version

Recommended next version:

`v1.70.1 — Production SSO Manual QA / Release Verification`

Goal:

- Commit and deploy v1.69.1.
- Execute the full credential-dependent checklist on production.
- Record pass / fail evidence.

Future architecture version:

`v1.71.0 — Pro Auth Bridge Hardening`

Goal:

- Move away from localStorage MVP session markers toward Supabase session or backend-validated bridge tokens for protected Pro APIs.

## Rollback

If v1.69.1 causes regression:

1. Revert Legacy Pro `app/sso/receive/page.tsx` and `app/lib/sso-session.ts` to v1.69.0.
2. Keep App `/api/pro/launch` unchanged.
3. Keep Legacy Pro `/login` as fallback.
4. Re-run Legacy Pro lint, build, and invalid-code QA.
