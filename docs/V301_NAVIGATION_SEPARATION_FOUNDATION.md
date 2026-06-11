# v3.01 Navigation Separation Foundation

Date: 2026-06-11

Objective: separate IXAI public website navigation from IXAI Workspace application navigation.

This release does not add investment features, portfolio engines, risk engines, FCN engines, market data providers, broker integrations, recommendation logic, AI logic, API contracts, schema changes, migrations, auth changes, membership changes, or entitlement changes.

## 1. Problem Summary

v3.00 created the Workspace route foundation successfully:

```text
/my-ixai
/my-ixai/home
/my-ixai/portfolio
/my-ixai/risk
/my-ixai/fcn
/my-ixai/intelligence
/my-ixai/settings
```

However, the global navigation still mixed:

- Public website surfaces.
- Legacy public content.
- Workspace application routes.

That made IXAI feel like a website and application were sharing one menu instead of a clear flow:

```text
一玄官網
↓
登入
↓
IXAI Workspace
```

## 2. Public Navigation Mode

Public Navigation is visible outside `/my-ixai`.

It preserves the public website layer:

- 市場首頁.
- 每日晨報.
- 市場總覽.
- 每週情報.
- FCN.
- IXAI Pro.
- About 一玄.
- 登入.

Public navigation is for:

- SEO surfaces.
- Brand surfaces.
- Education surfaces.
- Lead generation surfaces.

Public navigation must not show Workspace routes.

## 3. Workspace Navigation Mode

Workspace Navigation is visible on:

```text
/my-ixai
/my-ixai/*
```

It shows only:

- Workspace Home.
- Portfolio Center.
- Risk Center.
- FCN Center.
- Intelligence Center.
- Settings.
- 返回官網.

Workspace navigation must not show public website routes except the explicit `返回官網` exit entry.

## 4. Implementation Summary

The navigation now switches mode by pathname:

```text
pathname === "/my-ixai" || pathname.startsWith("/my-ixai/")
```

Affected surfaces:

- Desktop sidebar.
- Mobile drawer.
- Mobile bottom navigation.

The App shell remains unchanged. The split is contained in navigation components to keep this release low-risk.

## 5. Route Impact

No routes were removed.

Public routes remain intact:

- `/`
- `/daily-brief`
- `/market`
- `/weekly-brief`
- `/fcn`
- `/pro`
- `/about`
- `/login`

Workspace routes remain intact:

- `/my-ixai`
- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

## 6. Mobile Impact

Mobile drawer uses the same public / workspace mode split.

Mobile bottom navigation also switches:

- Public mode keeps the existing public browsing tabs.
- Workspace mode shows Workspace Home, Portfolio, Risk, FCN, and Intelligence.

Settings remains available in the Workspace drawer to avoid crowding the bottom bar.

## 7. Auth Impact

No auth provider, session provider, membership, entitlement, or login implementation changed.

The navigation now reinforces the intended authenticated product path, but it does not alter authentication logic.

## 8. Out of Scope

This release does not:

- Move Portfolio modules.
- Move Risk modules.
- Move FCN modules.
- Move Intelligence modules.
- Change public content.
- Change URLs.
- Add redirects.
- Add providers.
- Add investment features.
- Change API contracts.
- Change database schema.

## 9. Next Step

After v3.01, v3.02 should begin the first low-risk center decomposition:

- Move Risk Center ownership and presentation out of the overloaded Portfolio Center.
- Keep engine logic unchanged.
- Prefer route-level composition before component rewrites.
