// v1.34 — Distribution attribution foundation.
//
// Reads UTM parameters from the URL on first arrival, persists them in
// sessionStorage so subsequent conversions on the same session carry the
// same attribution context, and exposes a simple `getAttribution()`
// getter that the distribution components consume.
//
// No third-party analytics, no cookies, no cross-site tracking. Persists
// only inside sessionStorage so the data dies with the tab.

const ATTRIBUTION_STORAGE_KEY = "ixai.attribution.v1";

export type AttributionContext = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPath?: string;
  capturedAt?: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function safeRead(): AttributionContext | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AttributionContext;
    return parsed ?? null;
  } catch {
    return null;
  }
}

function safeWrite(context: AttributionContext): void {
  if (!isBrowser()) {
    return;
  }
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(context));
  } catch {
    // sessionStorage quota / privacy mode — degrade silently.
  }
}

function pickUtm(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key);
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim().slice(0, 80);
  return trimmed || undefined;
}

// Idempotent: only writes once per session, preserves the first-touch
// attribution even if the visitor later navigates to clean URLs.
export function captureAttributionFromLocation(): AttributionContext | null {
  if (!isBrowser()) {
    return null;
  }

  const existing = safeRead();
  if (existing && existing.capturedAt) {
    return existing;
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const context: AttributionContext = {
    utmSource: pickUtm(params, "utm_source"),
    utmMedium: pickUtm(params, "utm_medium"),
    utmCampaign: pickUtm(params, "utm_campaign"),
    utmContent: pickUtm(params, "utm_content"),
    utmTerm: pickUtm(params, "utm_term"),
    referrer: document.referrer ? document.referrer.slice(0, 160) : undefined,
    landingPath: `${url.pathname}${url.search || ""}`.slice(0, 200),
    capturedAt: new Date().toISOString(),
  };

  // Only persist when something actually identifies the visitor — saves
  // sessionStorage rows for direct traffic without UTM tags.
  const hasAnySignal =
    context.utmSource ||
    context.utmMedium ||
    context.utmCampaign ||
    context.referrer ||
    context.landingPath;

  if (hasAnySignal) {
    safeWrite(context);
  }

  return context;
}

export function getAttribution(): AttributionContext | null {
  return safeRead();
}

// Lightweight shape used as payload on tracked events / API submissions.
export function getAttributionPayload(): Record<string, string> {
  const context = safeRead();
  if (!context) {
    return {};
  }
  const payload: Record<string, string> = {};
  if (context.utmSource) payload.utm_source = context.utmSource;
  if (context.utmMedium) payload.utm_medium = context.utmMedium;
  if (context.utmCampaign) payload.utm_campaign = context.utmCampaign;
  if (context.utmContent) payload.utm_content = context.utmContent;
  if (context.utmTerm) payload.utm_term = context.utmTerm;
  if (context.referrer) payload.referrer = context.referrer;
  if (context.landingPath) payload.landing_path = context.landingPath;
  return payload;
}
