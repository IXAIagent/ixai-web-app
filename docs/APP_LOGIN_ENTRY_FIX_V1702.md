# v1.70.2 — App Login Entry Fix

## Purpose

v1.70.2 clarifies the App login entry after Pro logout QA.

After a user logs out from Legacy Pro, they may return to `app.ixuan.ai/login` and need to sign in again. The App login page must make existing-user login the primary action instead of making the page feel like account creation.

## Problem

`/login` already renders the password auth form in login mode, but the surrounding product copy still emphasized IXAI Account creation, identity foundation, and future continuity. This made the route feel like a registration surface, while the practical login path was easier to discover from `/register` through the small bottom link.

## Scope

Changed:

- `/login` copy and visible entry hierarchy.
- Shared password auth form wording for login/register mode.
- Version docs.

Out of scope:

- SSO launch code.
- Pro session behavior.
- Legacy Pro.
- Backend.
- Supabase auth logic.
- Daily / Weekly generation.
- FCN content.
- Provider ingestion.
- Stripe / trading.

## Login Page Rules

`/login` must clearly support existing user login:

- Title: `進入 IXAI`
- Primary action: `登入`
- Secondary action: `建立 IXAI Account`
- Email / password fields must be directly usable on `/login`.
- Traditional Chinese should lead the page copy.

`/register` remains the account creation page:

- Title: `建立 IXAI Account`
- Primary action: `建立 IXAI Account`
- Secondary action: `前往登入`

## UX Change

The shared auth form now presents a simple mode switch:

```text
登入 | 建立帳號
```

On `/login`, `登入` is visually primary and the submit button reads `登入`.

On `/register`, `建立帳號` is visually primary and account creation remains available without changing the underlying auth flow.

## Rollback

If the copy creates confusion:

1. Revert `components/auth/password-auth-form.tsx`.
2. Keep `app/login/page.tsx` and `app/register/page.tsx` route modes unchanged.
3. Re-run lint, build, and mobile QA.
