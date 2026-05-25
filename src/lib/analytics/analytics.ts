// v1.33 — Per-spec entry point. Today this is a thin re-export of the
// v1.29.5 `events` module so the existing call sites keep working. The
// goal is to give external code one stable import path:
//
//   import { trackEvent } from "@/src/lib/analytics/analytics";
//
// Future PostHog / Mixpanel / GA4 wiring registers an external handler
// inside this module without touching call sites.

export {
  registerAnalyticsHandler,
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsEventPayload,
} from "@/src/lib/analytics/events";
