const IXAI_STATIC_CACHE = "ixai-static-v1.30";

const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/icons/ixai-icon-192.png",
  "/icons/ixai-icon-512.png",
  "/icons/ixai-maskable-512.png",
  "/logo/ixuan-logo.png",
  "/og/ixai-og.png",
];

const EXCLUDED_PREFIXES = [
  "/admin",
  "/account",
  "/login",
  "/register",
  "/auth",
  "/api/admin",
  "/api/auth",
  "/api/session",
  "/api/supabase",
  "/api/user",
  "/api/market",
  "/api/news",
  "/api/daily-briefs",
];

const EXCLUDED_KEYWORDS = [
  "cron",
  "draft",
  "generate",
  "oauth",
  "password",
  "scheduler",
  "session",
  "service-role",
  "supabase",
  "token",
];

function isExcluded(url) {
  if (url.origin !== self.location.origin) {
    return true;
  }

  const path = url.pathname;

  if (EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true;
  }

  return EXCLUDED_KEYWORDS.some((keyword) => path.includes(keyword));
}

function isStaticAsset(url) {
  const path = url.pathname;

  return (
    path.startsWith("/_next/static/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/logo/") ||
    path.startsWith("/og/") ||
    path === "/manifest.webmanifest" ||
    path === "/favicon.ico" ||
    path === "/icon.png" ||
    path === "/apple-icon.png"
  );
}

function createEmptyResponse(status = 204) {
  return new Response(status === 204 ? null : "", {
    status,
    statusText: status === 204 ? "No Content" : "Service Unavailable",
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function createOfflineNavigationResponse() {
  return new Response(
    "<!doctype html><html lang=\"zh-Hant\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>IXAI Offline</title><body style=\"margin:0;background:#f5f0e6;color:#09291f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;\"><main style=\"min-height:100vh;display:grid;place-items:center;padding:24px;\"><section style=\"max-width:440px;border:1px solid #ded4c0;border-radius:12px;background:#fffaf0;padding:24px;\"><p style=\"font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b08d57;margin:0 0 12px;\">IXAI Offline</p><h1 style=\"font-size:22px;line-height:1.35;margin:0 0 12px;\">目前離線</h1><p style=\"font-size:14px;line-height:1.8;margin:0;color:#64736b;\">市場資料與最新簡報可能無法更新。請重新連線後再查看即時行情與最新風險觀察。</p></section></main></body></html>",
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}

async function safeFetch(request, fallbackResponse) {
  try {
    return await fetch(request);
  } catch {
    return fallbackResponse;
  }
}

async function cacheStaticAsset(request) {
  try {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    if (response.ok) {
      const copy = response.clone();

      try {
        const cache = await caches.open(IXAI_STATIC_CACHE);
        await cache.put(request, copy);
      } catch {
        // Cache write failures should never reject the fetch event.
      }
    }

    return response;
  } catch {
    return createEmptyResponse(204);
  }
}

async function handleFetch(event) {
  const request = event.request;
  const url = new URL(request.url);

  try {
    if (request.method !== "GET") {
      return await safeFetch(request, createEmptyResponse(503));
    }

    if (request.mode === "navigate") {
      return await safeFetch(request, createOfflineNavigationResponse());
    }

    if (isExcluded(url)) {
      return await safeFetch(request, createEmptyResponse(503));
    }

    if (isStaticAsset(url)) {
      try {
        return await cacheStaticAsset(request);
      } catch {
        return createEmptyResponse(204);
      }
    }

    return await safeFetch(request, createEmptyResponse(204));
  } catch {
    if (request.mode === "navigate") {
      return createOfflineNavigationResponse();
    }

    return createEmptyResponse(204);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(IXAI_STATIC_CACHE);

        await Promise.all(
          PRECACHE_URLS.map(async (url) => {
            try {
              await cache.add(url);
            } catch {
              // A single missing icon or transient asset failure must not keep an old SW active.
            }
          }),
        );
      } catch {
        // SW installation should fail open so the browser can activate the safer fetch handler.
      }

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith("ixai-") && key !== IXAI_STATIC_CACHE)
            .map(async (key) => {
              try {
                await caches.delete(key);
              } catch {
                // Cache cleanup is best-effort and must not block activation.
              }
            }),
        );
      } catch {
        // Activation should still claim clients even when cache cleanup fails.
      }

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});

// v1.27 push foundation — placeholder handlers only. No server dispatch yet;
// these are wired so that when push is enabled later, the SW already knows
// how to render and route notifications without a second deploy.
self.addEventListener("push", (event) => {
  let payload = {};

  if (event && event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: "IXAI 市場通知", body: event.data.text() };
    }
  }

  const title = payload.title || "IXAI 市場通知";
  const options = {
    body: payload.body || "市場有新的觀察更新，回到 IXAI 查看詳情。",
    icon: payload.icon || "/icons/ixai-icon-192.png",
    badge: payload.badge || "/icons/ixai-icon-192.png",
    tag: payload.tag || "ixai-default",
    data: {
      url: payload.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsList) => {
        for (const client of clientsList) {
          if ("focus" in client && client.url.includes(self.location.origin)) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl).catch(() => null);
            }
            return null;
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return null;
      }),
  );
});
