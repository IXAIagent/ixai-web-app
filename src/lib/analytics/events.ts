// v1.29.5 — analytics event surface.
//
// This is intentionally a tiny, dependency-free module. We are NOT shipping
// a heavy analytics SDK before public beta. What we do ship is a single
// typed event API so every call site uses the same vocabulary, and a
// future Google Analytics / Plausible / Mixpanel hookup can be wired in
// one place without hunting through components.
//
// All events route through the env-gated log helper:
//   - development: console.debug
//   - production browser: silent
//   - production server: noop (events are client-fired)
//
// Do not add network calls here without explicit user/PM sign-off.

import { log } from "@/src/lib/log";
import type { AnalyticsEventName, AnalyticsPayload } from "@/src/lib/analytics/schema";

export type AnalyticsEventPayload = AnalyticsPayload;

type AnalyticsHandler = (
  event: AnalyticsEventName,
  payload?: AnalyticsEventPayload,
) => void;

let externalHandler: AnalyticsHandler | null = null;

// Public hook used by a future analytics integration (e.g. wiring up
// Plausible or PostHog). Wiring stays a single-call-site change.
export function registerAnalyticsHandler(handler: AnalyticsHandler | null) {
  externalHandler = handler;
}

export function trackEvent(
  event: AnalyticsEventName,
  payload?: AnalyticsEventPayload,
) {
  log.debug("[ixai.analytics]", event, payload ?? {});

  if (externalHandler) {
    try {
      externalHandler(event, payload);
    } catch (error) {
      log.warn("[ixai.analytics] handler error", error);
    }
  }
}
