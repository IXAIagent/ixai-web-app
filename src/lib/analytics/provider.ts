// v1.33.2 — Analytics provider abstraction.
//
// Sits one level above the v1.29.5 trackEvent surface so when a real
// provider (PostHog / Mixpanel / GA4) lands, it registers here and the
// rest of the codebase keeps importing `track` / `identify` unchanged.
//
// Today: dev console; production silent. No network calls. No cookies.
// No third-party SDK loaded.

import { log } from "@/src/lib/log";
import type {
  AnalyticsEventName,
  AnalyticsEventPayload,
} from "@/src/lib/analytics/events";
import {
  registerAnalyticsHandler as registerEventHandler,
  trackEvent,
} from "@/src/lib/analytics/events";

export type AnalyticsIdentity = {
  userId: string;
  email?: string;
  displayName?: string;
  traits?: Record<string, string | number | boolean | undefined>;
};

export type AnalyticsProvider = {
  name: string;
  track(event: AnalyticsEventName, payload?: AnalyticsEventPayload): void | Promise<void>;
  identify?(identity: AnalyticsIdentity): void | Promise<void>;
};

let registeredProvider: AnalyticsProvider | null = null;
let knownIdentity: AnalyticsIdentity | null = null;

export function registerAnalyticsProvider(provider: AnalyticsProvider | null) {
  registeredProvider = provider;

  registerEventHandler((event, payload) => {
    if (!registeredProvider) {
      return;
    }
    try {
      void registeredProvider.track(event, payload);
    } catch (error) {
      log.warn("[ixai.analytics] provider track error", error);
    }
  });

  if (registeredProvider && knownIdentity && registeredProvider.identify) {
    try {
      void registeredProvider.identify(knownIdentity);
    } catch (error) {
      log.warn("[ixai.analytics] provider identify error", error);
    }
  }
}

export function track(
  event: AnalyticsEventName,
  payload?: AnalyticsEventPayload,
) {
  trackEvent(event, payload);
}

export function identify(identity: AnalyticsIdentity) {
  knownIdentity = identity;
  log.debug("[ixai.analytics.identify]", identity);

  if (!registeredProvider?.identify) {
    return;
  }
  try {
    void registeredProvider.identify(identity);
  } catch (error) {
    log.warn("[ixai.analytics] provider identify error", error);
  }
}

export function getRegisteredAnalyticsProvider(): AnalyticsProvider | null {
  return registeredProvider;
}
