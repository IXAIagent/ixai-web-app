import { log } from "@/src/lib/log";
import type {
  AnalyticsEventName,
  AnalyticsPayload,
} from "@/src/lib/analytics/schema";
import {
  isAnalyticsEventName,
  type AnalyticsAttribution,
} from "@/src/lib/analytics/schema";
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
  enabled: boolean;
  track(event: AnalyticsEventName, payload?: AnalyticsPayload): void | Promise<void>;
  identify?(identity: AnalyticsIdentity): void | Promise<void>;
  page?(path: string, metadata?: AnalyticsPayload): void | Promise<void>;
};

let registeredProvider: AnalyticsProvider | null = null;
let knownIdentity: AnalyticsIdentity | null = null;

function validateEvent(event: AnalyticsEventName) {
  return isAnalyticsEventName(event);
}

function sanitizePrimitive(value: unknown): string | number | boolean | undefined {
  if (typeof value === "string") {
    return value.slice(0, 500);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function sanitizeAttribution(value: unknown): AnalyticsAttribution | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const attribution: AnalyticsAttribution = {};

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (
      key === "utm_source" ||
      key === "utm_medium" ||
      key === "utm_campaign" ||
      key === "utm_content" ||
      key === "utm_term" ||
      key === "referrer" ||
      key === "landing_path"
    ) {
      const clean = sanitizePrimitive(item);

      if (typeof clean === "string") {
        attribution[key] = clean.slice(0, 220);
      }
    }
  }

  return Object.keys(attribution).length ? attribution : undefined;
}

export function sanitizeAnalyticsPayload(payload?: AnalyticsPayload): AnalyticsPayload | undefined {
  if (!payload) {
    return undefined;
  }

  const sanitized: AnalyticsPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("email") ||
      lowerKey.includes("token") ||
      lowerKey.includes("cookie") ||
      lowerKey.includes("password") ||
      lowerKey.includes("secret")
    ) {
      continue;
    }

    if (key === "attribution") {
      const attribution = sanitizeAttribution(value);

      if (attribution) {
        sanitized.attribution = attribution;
      }
      continue;
    }

    const clean = sanitizePrimitive(value);

    if (clean !== undefined) {
      sanitized[key] = clean;
    }
  }

  return sanitized;
}

export function registerAnalyticsProvider(provider: AnalyticsProvider | null) {
  registeredProvider = provider;

  registerEventHandler((event, payload) => {
    if (!registeredProvider?.enabled) {
      return;
    }

    try {
      void registeredProvider.track(event, sanitizeAnalyticsPayload(payload));
    } catch (error) {
      log.warn("[ixai.analytics] provider track error", error);
    }
  });

  if (registeredProvider && knownIdentity) {
    safeIdentify(knownIdentity);
  }
}

export function getAnalyticsProvider(): AnalyticsProvider | null {
  return registeredProvider;
}

export function safeTrack(event: AnalyticsEventName, payload?: AnalyticsPayload) {
  if (!validateEvent(event)) {
    return;
  }

  trackEvent(event, sanitizeAnalyticsPayload(payload));
}

export function safeIdentify(identity: AnalyticsIdentity) {
  knownIdentity = identity;

  if (!registeredProvider?.identify || !registeredProvider.enabled) {
    return;
  }

  try {
    void registeredProvider.identify(identity);
  } catch (error) {
    log.warn("[ixai.analytics] provider identify error", error);
  }
}

export function safePage(path: string, metadata?: AnalyticsPayload) {
  if (!registeredProvider?.page || !registeredProvider.enabled) {
    safeTrack("page_view", {
      ...metadata,
      path,
    });
    return;
  }

  try {
    void registeredProvider.page(path, sanitizeAnalyticsPayload(metadata));
  } catch (error) {
    log.warn("[ixai.analytics] provider page error", error);
  }
}

export function track(
  event: AnalyticsEventName,
  payload?: AnalyticsPayload,
) {
  safeTrack(event, payload);
}

export function identify(identity: AnalyticsIdentity) {
  safeIdentify(identity);
}
