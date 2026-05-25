# Admin Shell Separation

v1.37.3 separates IXAI Public App navigation from the internal Admin Console.

## Route Strategy

- Public routes keep the consumer app shell: sidebar, mobile top bar, mobile
  bottom nav and footer.
- `/admin` and `/admin/*` use the Admin Shell: dark internal console, compact
  sidebar, mobile top console nav and no public navigation.
- Admin access remains protected by the existing Admin Gate. No auth/session
  architecture changes were introduced.

## Why Admin Shell Is Separate

The Public App is a subscriber and Pro conversion product. The Admin Console is
an operating surface for editorial workflow, audience intelligence,
distribution, analytics and membership readiness. Mixing the public nav with
internal operating modules makes the product hierarchy unclear and creates
mobile clutter.

## Admin IA

The Admin sidebar groups surfaces as:

- Overview
- Editorial
- Growth
- Analytics
- System

Where independent admin sub-routes do not yet exist, links use `/admin#anchor`
targets so we avoid premature route sprawl.

## Future Advisor Console Possibility

The current shell is internal-only. A future advisor console could reuse parts of
this IA but should have separate auth, role checks and client-safe views before
any customer data is displayed.

## Deferred

- Role-based admin users
- Dedicated Search Console route
- Dedicated system health route
- Log viewer
- Advisor-facing console
