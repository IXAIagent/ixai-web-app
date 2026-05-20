# IXAI Admin Security

## Current State

IXAI Web App v1.6.1 uses a minimal MVP password gate for `/admin` and `/admin/daily-briefs`.

- The password is read from `IXAI_ADMIN_PASSWORD`.
- The password must never be committed to the repository.
- The browser stores successful access in `sessionStorage` for the current browser session.
- Local development may run without `IXAI_ADMIN_PASSWORD`, but the UI will remain an internal access surface.
- Production without `IXAI_ADMIN_PASSWORD` is locked by the server layout and will not render admin content.

## Production Requirement

Vercel production must define:

```bash
IXAI_ADMIN_PASSWORD=your-secure-password
```

Do not use `NEXT_PUBLIC_` for this password.

## Limitations

This is not production-grade authentication. It is a temporary safety layer to prevent an obviously open editorial console.

The formal version should move to:

- Supabase Auth
- Role-based access control
- Server-side authorization checks
- Database row-level security policies
- Admin audit events

## Operational Rule

Do not write the admin password into source code, docs, screenshots, issue comments, or generated content.
