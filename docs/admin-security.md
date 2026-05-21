# IXAI Admin Security

## Current State

IXAI Web App uses a minimal MVP password gate for `/admin` and `/admin/daily-briefs`.

- The password is read from `IXAI_ADMIN_PASSWORD`.
- The password must never be committed to the repository.
- Password verification happens server-side through `/api/admin/session`.
- Successful access sets an httpOnly SameSite cookie for the admin session.
- The browser also stores a non-secret `sessionStorage` marker for current-session UX.
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

v1.18 removes the earlier client-visible password hash pattern. Admin API calls should rely on the httpOnly session cookie or cron secret, not a browser-visible hash.

The formal version should move to:

- Supabase Auth
- Role-based access control
- Server-side authorization checks
- Database row-level security policies
- Admin audit events

## Remaining Risks

- No named admin users.
- No audit log.
- No role claims.
- No brute-force/rate-limit protection at the application layer.
- The admin UI is still a lightweight editorial console, not a full CMS.

## Operational Rule

Do not write the admin password into source code, docs, screenshots, issue comments, or generated content.
