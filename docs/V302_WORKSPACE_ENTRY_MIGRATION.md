# v3.02 Workspace Entry Migration

Date: 2026-06-11

Objective: make IXAI Workspace Home the authenticated entry point.

This release does not change auth providers, Supabase schema, membership, entitlement logic, portfolio engines, risk engines, FCN engines, intelligence engines, market data providers, broker providers, API contracts, or migrations.

## 1. Problem Summary

Before v3.02, the authenticated path still behaved like a legacy flow:

```text
Login
↓
/account
↓
IXAI Pro / Legacy Pro surfaces
```

That conflicted with the v3.00 / v3.01 product direction:

```text
一玄官網
↓
登入
↓
IXAI Workspace
```

## 2. New Entry Flow

The preferred authenticated entry flow is now:

```text
Login
↓
/my-ixai/home
```

Register follows the same landing behavior when registration returns an authenticated session.

Authenticated users who visit `/login` or `/register` are redirected to `/my-ixai/home`.

## 3. Account Page Migration

`/account` is now a legacy transitional page.

It explains:

- The IXAI Workspace is active.
- Account is no longer the primary product entry.
- Users should enter Workspace Home and then choose Portfolio, Risk, FCN, Intelligence, or Settings.

The primary CTA is:

```text
進入 Workspace → /my-ixai/home
```

## 4. Legacy Pro CTA Cleanup

The Account page no longer uses the old `開啟 IXAI Pro` primary CTA.

The primary product CTA now points to IXAI Workspace instead of Legacy Pro.

## 5. Navigation State Cleanup

When a user is authenticated:

- Public navigation should not show `登入`.
- Public navigation may show `我的 IXAI Workspace`.
- Workspace navigation remains Workspace-only.
- Workspace navigation keeps `返回官網`.

## 6. Workspace Home First Impression

`/my-ixai/home` now provides a simple Workspace hero and center cards for:

- Portfolio Center.
- Risk Center.
- FCN Center.
- Intelligence Center.
- Settings.

The page is still route / entry experience only. It does not add investment logic.

## 7. Out of Scope

v3.02 does not:

- Redesign auth.
- Change auth provider behavior.
- Change membership or entitlement rules.
- Change Supabase schema.
- Add migrations.
- Add API routes.
- Change Portfolio, Risk, FCN, Intelligence, market data, broker, AI, or recommendation engines.

## 8. Validation Checklist

- Login success redirects to `/my-ixai/home`.
- Register success redirects to `/my-ixai/home` when authenticated.
- Authenticated `/login` or `/register` redirects to `/my-ixai/home`.
- `/account` shows Workspace Transition Page.
- `進入 Workspace` links to `/my-ixai/home`.
- Public and Workspace navigation modes remain separated.
- Mobile drawer and mobile bottom nav remain responsive.
