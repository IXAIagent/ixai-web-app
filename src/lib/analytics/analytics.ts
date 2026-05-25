// v1.33 — Per-spec entry point. Today this is a thin re-export of the
// v1.29.5 `events` module so the existing call sites keep working. The
// goal is to give external code one stable import path:
//
//   import { trackEvent } from "@/src/lib/analytics/analytics";
//
// Future PostHog / Mixpanel / GA4 wiring registers an external handler
// inside this module without touching call sites.

export {
  trackEvent,
  type AnalyticsEventPayload,
} from "@/src/lib/analytics/events";
export type { AnalyticsEventName, AnalyticsPayload } from "@/src/lib/analytics/schema";
export {
  getAnalyticsProvider,
  identify,
  registerAnalyticsProvider,
  safeIdentify,
  safePage,
  safeTrack,
  track,
  type AnalyticsIdentity,
  type AnalyticsProvider,
} from "@/src/lib/analytics/provider";
export {
  getAnonymousDistinctId,
  safeAlias,
  safeIdentify as safeIdentifySubscriber,
  sanitizeIdentifyPayload,
} from "@/src/lib/analytics/identity";
