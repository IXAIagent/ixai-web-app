export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BackendHealthResponse = {
  ok: boolean;
  backendUrlConfigured: boolean;
  backendStatus: string;
  checkedAt: string;
  source: "ixai-backend";
};

const DEVELOPMENT_BACKEND_URL = "http://localhost:8000";

function getBackendUrl() {
  const configuredUrl = process.env.IXAI_BACKEND_URL?.trim().replace(/\/$/, "");

  if (configuredUrl) {
    return {
      backendUrl: configuredUrl,
      backendUrlConfigured: true,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      backendUrl: DEVELOPMENT_BACKEND_URL,
      backendUrlConfigured: false,
    };
  }

  return {
    backendUrl: null,
    backendUrlConfigured: false,
  };
}

async function fetchBackendHealth(backendUrl: string, path: "/health" | "/readyz") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      payload,
      path,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function backendStatusFromPayload(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const data = payload as Record<string, unknown>;
  const status = data.status ?? data.state ?? data.message;

  return typeof status === "string" && status.trim() ? status : fallback;
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const { backendUrl, backendUrlConfigured } = getBackendUrl();

  if (!backendUrl) {
    const payload: BackendHealthResponse = {
      ok: false,
      backendUrlConfigured,
      backendStatus: "not_configured",
      checkedAt,
      source: "ixai-backend",
    };

    return Response.json(payload);
  }

  try {
    const health = await fetchBackendHealth(backendUrl, "/health");

    if (health.ok) {
      const payload: BackendHealthResponse = {
        ok: true,
        backendUrlConfigured,
        backendStatus: backendStatusFromPayload(health.payload, "healthy"),
        checkedAt,
        source: "ixai-backend",
      };

      return Response.json(payload);
    }

    const readyz = await fetchBackendHealth(backendUrl, "/readyz");

    const payload: BackendHealthResponse = {
      ok: readyz.ok,
      backendUrlConfigured,
      backendStatus: readyz.ok
        ? backendStatusFromPayload(readyz.payload, "ready")
        : `unavailable:${health.status}/${readyz.status}`,
      checkedAt,
      source: "ixai-backend",
    };

    return Response.json(payload, { status: readyz.ok ? 200 : 503 });
  } catch {
    const payload: BackendHealthResponse = {
      ok: false,
      backendUrlConfigured,
      backendStatus: "unavailable",
      checkedAt,
      source: "ixai-backend",
    };

    return Response.json(payload, { status: 503 });
  }
}
