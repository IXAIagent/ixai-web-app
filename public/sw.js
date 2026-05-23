const IXAI_STATIC_CACHE = "ixai-static-v1.20.8";

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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(IXAI_STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ixai-") && key !== IXAI_STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (isExcluded(url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(IXAI_STATIC_CACHE).then((cache) => cache.put(request, copy));
          }

          return response;
        });
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            "<!doctype html><html lang=\"zh-Hant\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>IXAI Offline</title><body style=\"margin:0;background:#f5f0e6;color:#09291f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;\"><main style=\"min-height:100vh;display:grid;place-items:center;padding:24px;\"><section style=\"max-width:440px;border:1px solid #ded4c0;border-radius:12px;background:#fffaf0;padding:24px;\"><p style=\"font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b08d57;margin:0 0 12px;\">IXAI Offline</p><h1 style=\"font-size:22px;line-height:1.35;margin:0 0 12px;\">目前離線</h1><p style=\"font-size:14px;line-height:1.8;margin:0;color:#64736b;\">市場資料與最新簡報可能無法更新。請重新連線後再查看即時行情與最新風險觀察。</p></section></main></body></html>",
            {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
              },
            },
          ),
      ),
    );
  }
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
