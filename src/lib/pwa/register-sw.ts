// v1.27 push foundation — client-only service worker registration helper.
// Production-only, idempotent, and never throws into the host page.

const SW_SCRIPT_PATH = "/sw.js";
const SW_SCOPE = "/";

let registrationInFlight: Promise<ServiceWorkerRegistration | null> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

export function isServiceWorkerSupported(): boolean {
  return isBrowser() && "serviceWorker" in navigator;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  if (registrationInFlight) {
    return registrationInFlight;
  }

  registrationInFlight = (async () => {
    try {
      const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);

      if (existing && existing.active?.scriptURL.endsWith(SW_SCRIPT_PATH)) {
        return existing;
      }

      return await navigator.serviceWorker.register(SW_SCRIPT_PATH, {
        scope: SW_SCOPE,
        updateViaCache: "none",
      });
    } catch (error) {
      // Reading or admin workflows must never be interrupted by SW errors.
      console.warn("[ixai] service worker registration skipped:", error);
      return null;
    } finally {
      // Clear after a tick so genuinely repeated calls still de-dupe within
      // the same render pass but a later retry can attempt afresh.
      setTimeout(() => {
        registrationInFlight = null;
      }, 0);
    }
  })();

  return registrationInFlight;
}
