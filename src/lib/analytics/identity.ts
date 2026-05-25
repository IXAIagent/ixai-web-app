import { log } from "@/src/lib/log";
import { getAnalyticsProvider } from "@/src/lib/analytics/provider";

type IdentifyValue = string | number | boolean;
type IdentifyPayload = Record<string, IdentifyValue>;

const BLOCKED_KEYS = ["token", "cookie", "password", "secret", "session", "auth"];
const MAX_IDENTIFY_FIELDS = 24;
const MAX_STRING_LENGTH = 300;

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function cleanId(value: string) {
  return value.trim().slice(0, 220);
}

function sanitizeValue(value: unknown): IdentifyValue | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, MAX_STRING_LENGTH) : undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

export function sanitizeIdentifyPayload(
  payload?: Record<string, unknown>,
): IdentifyPayload | undefined {
  if (!payload) {
    return undefined;
  }

  const sanitized: IdentifyPayload = {};

  for (const [key, value] of Object.entries(payload).slice(0, MAX_IDENTIFY_FIELDS)) {
    const cleanKey = key.trim().slice(0, 80);
    const lowerKey = cleanKey.toLowerCase();

    if (!cleanKey || BLOCKED_KEYS.some((blocked) => lowerKey.includes(blocked))) {
      continue;
    }

    const cleanValue = sanitizeValue(value);

    if (cleanValue !== undefined) {
      sanitized[cleanKey] = cleanValue;
    }
  }

  return Object.keys(sanitized).length ? sanitized : undefined;
}

export function getAnonymousDistinctId(): string | null {
  const provider = getAnalyticsProvider();

  if (!provider?.enabled || !provider.getDistinctId) {
    return null;
  }

  try {
    const distinctId = provider.getDistinctId();
    return distinctId ? cleanId(distinctId) : null;
  } catch (error) {
    if (isDev()) {
      log.warn("[ixai.analytics.identity] distinct id unavailable", error);
    }
    return null;
  }
}

export function safeIdentify(
  distinctId: string,
  properties?: Record<string, unknown>,
) {
  const provider = getAnalyticsProvider();
  const cleanDistinctId = cleanId(distinctId);

  if (!cleanDistinctId || !provider?.enabled || !provider.identify) {
    return;
  }

  try {
    void provider.identify({
      userId: cleanDistinctId,
      traits: sanitizeIdentifyPayload(properties),
    });
  } catch (error) {
    if (isDev()) {
      log.warn("[ixai.analytics.identity] identify failed", error);
    }
  }
}

export function safeAlias(previousId: string, nextId: string) {
  const provider = getAnalyticsProvider();
  const cleanPreviousId = cleanId(previousId);
  const cleanNextId = cleanId(nextId);

  if (
    !cleanPreviousId ||
    !cleanNextId ||
    cleanPreviousId === cleanNextId ||
    !provider?.enabled ||
    !provider.alias
  ) {
    return;
  }

  try {
    void provider.alias(cleanPreviousId, cleanNextId);
  } catch (error) {
    if (isDev()) {
      log.warn("[ixai.analytics.identity] alias failed", error);
    }
  }
}
