import posthog from "posthog-js";
import type {
  AnalyticsIdentity,
  AnalyticsProvider,
} from "@/src/lib/analytics/provider";
import { sanitizeAnalyticsPayload } from "@/src/lib/analytics/provider";
import { sanitizeIdentifyPayload } from "@/src/lib/analytics/identity";
import type { AnalyticsEventName, AnalyticsPayload } from "@/src/lib/analytics/schema";

let initialized = false;

function warnInDev(message: string, error?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error ?? "");
  }
}

function getPosthogConfig() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

  return { key, host };
}

function isProductionBrowser() {
  return typeof window !== "undefined" && process.env.NODE_ENV === "production";
}

function initPosthog() {
  const { key, host } = getPosthogConfig();

  if (!key || !isProductionBrowser()) {
    return false;
  }

  if (!initialized) {
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      loaded: () => {
        initialized = true;
      },
      persistence: "localStorage",
      person_profiles: "identified_only",
      request_batching: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          email: true,
          password: true,
        },
      },
    });
    initialized = true;
  }

  return true;
}

export function createPosthogProvider(): AnalyticsProvider {
  const { key } = getPosthogConfig();
  const enabled = Boolean(key) && isProductionBrowser();

  return {
    name: enabled ? "posthog" : "posthog-disabled",
    enabled,
    track(event: AnalyticsEventName, payload?: AnalyticsPayload) {
      if (!initPosthog()) {
        return;
      }

      posthog.capture(event, sanitizeAnalyticsPayload(payload));
    },
    identify(identity: AnalyticsIdentity) {
      if (!initPosthog()) {
        return;
      }

      try {
        posthog.identify(identity.userId, sanitizeIdentifyPayload(identity.traits));
      } catch (error) {
        warnInDev("[IXAI ANALYTICS] PostHog identify failed", error);
      }
    },
    alias(previousId: string, nextId: string) {
      if (!initPosthog()) {
        return;
      }

      try {
        posthog.alias(nextId, previousId);
      } catch (error) {
        warnInDev("[IXAI ANALYTICS] PostHog alias failed", error);
      }
    },
    getDistinctId() {
      if (!initPosthog()) {
        return null;
      }

      try {
        return posthog.get_distinct_id();
      } catch (error) {
        warnInDev("[IXAI ANALYTICS] PostHog distinct id unavailable", error);
        return null;
      }
    },
    page(path: string, metadata?: AnalyticsPayload) {
      if (!initPosthog()) {
        return;
      }

      posthog.capture("page_view", {
        ...sanitizeAnalyticsPayload(metadata),
        path,
        $current_url: typeof window !== "undefined" ? window.location.href : path,
      });
    },
  };
}
