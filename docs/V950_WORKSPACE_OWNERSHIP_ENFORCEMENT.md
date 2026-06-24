# V9.50 Workspace Ownership Enforcement

## Goal

Strengthen ownership helper contracts without changing current auth behavior.

## Files

- `src/lib/persistence/ownership/ownership-service.ts`
- `src/lib/persistence/ownership/ownership-types.ts`

## Behavior

- Adds `getCurrentWorkspaceOwner()`.
- Adds `assertWorkspaceReadAccess()`.
- Adds `buildUserScopedQuery()`.
- Returns limited status when no authenticated owner context is provided.
- Does not redirect, change middleware, or change login/register behavior.

## Boundary

No cross-user data exposure, no auth behavior change, no route protection change, and no hard redirects.
