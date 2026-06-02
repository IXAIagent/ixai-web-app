import type { ProAccessIdentity } from "@/src/lib/pro/access";

export type ProAccountLinkStatus =
  | "not_started"
  | "linked"
  | "backend_not_configured"
  | "backend_contract_missing"
  | "error";

export type ProAccountLinkState = {
  status: ProAccountLinkStatus;
  backendAccountId: string | null;
  requiresAction: boolean;
  message: string;
};

type BackendAccountLinkResponse = {
  backend_account_id?: string | null;
  backendAccountId?: string | null;
  backend_user_id?: string | null;
  pro_access_status?: string | null;
  created?: boolean;
};

type BackendAccountLinkResult =
  | {
      ok: true;
      state: ProAccountLinkState;
    }
  | {
      ok: false;
      httpStatus: number;
      state: ProAccountLinkState;
    };

export function getConfiguredBackendUrl() {
  return process.env.IXAI_BACKEND_URL?.trim().replace(/\/$/, "") || null;
}

export function getDefaultAccountLinkState(identity: ProAccessIdentity): ProAccountLinkState {
  if (!identity.authenticated) {
    return {
      backendAccountId: null,
      message: "Sign in with your IXAI App account before Pro identity linking can start.",
      requiresAction: true,
      status: "not_started",
    };
  }

  if (!getConfiguredBackendUrl()) {
    return {
      backendAccountId: null,
      message: "IXAI_BACKEND_URL is not configured, so backend account linking is not active.",
      requiresAction: true,
      status: "backend_not_configured",
    };
  }

  return {
    backendAccountId: null,
    message: "Backend account-link endpoint is pending implementation.",
    requiresAction: true,
    status: "backend_contract_missing",
  };
}

function sanitizeBackendAccountId(payload: BackendAccountLinkResponse) {
  const value = payload.backend_account_id ?? payload.backendAccountId;

  return typeof value === "string" && value.trim() ? value : null;
}

export async function linkSupabaseAccountToBackend(
  identity: ProAccessIdentity,
): Promise<BackendAccountLinkResult> {
  if (!identity.authenticated || identity.source !== "supabase" || !identity.externalUserId) {
    return {
      httpStatus: 401,
      ok: false,
      state: {
        backendAccountId: null,
        message: "Sign in with IXAI App before linking a backend Pro account.",
        requiresAction: true,
        status: "not_started",
      },
    };
  }

  const backendUrl = getConfiguredBackendUrl();

  if (!backendUrl) {
    return {
      httpStatus: 503,
      ok: false,
      state: {
        backendAccountId: null,
        message: "IXAI backend is not configured for account linking.",
        requiresAction: true,
        status: "backend_not_configured",
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${backendUrl}/api/v1/integrations/supabase/account-link`, {
      body: JSON.stringify({
        email: identity.email ?? null,
        external_user_id: identity.externalUserId,
        name: identity.name ?? null,
        provider: "supabase",
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    if (response.status === 404 || response.status === 405) {
      return {
        httpStatus: 501,
        ok: false,
        state: {
          backendAccountId: null,
          message: "Backend account-link endpoint is not available yet.",
          requiresAction: true,
          status: "backend_contract_missing",
        },
      };
    }

    if (!response.ok) {
      return {
        httpStatus: 502,
        ok: false,
        state: {
          backendAccountId: null,
          message: `Backend account-link request failed with status ${response.status}.`,
          requiresAction: true,
          status: "error",
        },
      };
    }

    const payload = (await response.json().catch(() => ({}))) as BackendAccountLinkResponse;
    const backendAccountId = sanitizeBackendAccountId(payload);

    return {
      ok: true,
      state: {
        backendAccountId,
        message: backendAccountId
          ? "Backend account link was created or found."
          : "Backend account-link endpoint responded, but no backend account id was returned.",
        requiresAction: backendAccountId === null,
        status: backendAccountId ? "linked" : "error",
      },
    };
  } catch {
    return {
      httpStatus: 503,
      ok: false,
      state: {
        backendAccountId: null,
        message: "Backend account-link request could not reach IXAI backend.",
        requiresAction: true,
        status: "error",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
