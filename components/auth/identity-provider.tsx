"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { MembershipPlan, MembershipStatus } from "@/src/lib/membership/memberships";

export type LightweightIdentityState =
  | "loading"
  | "anonymous"
  | "line_connected"
  | "identified"
  | "pro"
  | "enterprise";

export type LightweightIdentity = {
  normalized_email: string;
};

export type LightweightMembership = {
  plan: MembershipPlan;
  status: MembershipStatus;
};

export type LightweightUnifiedIdentity = {
  tags: string[];
};

type IdentityResponse = {
  authenticated?: boolean;
  identity?: LightweightIdentity | null;
  intelligence_sync_ready?: boolean;
  line_display_name?: string | null;
  line_connected?: boolean;
  line_login_ready?: boolean;
  line_user_id?: string | null;
  liff_ready?: boolean;
  membership?: LightweightMembership | null;
  ok?: boolean;
  pro_candidate?: boolean;
  unified_identity?: LightweightUnifiedIdentity | null;
};

type IdentityContextValue = {
  identify: (email: string, source?: string) => Promise<boolean>;
  identity: LightweightIdentity | null;
  intelligenceSyncReady: boolean;
  lineDisplayName: string | null;
  lineConnected: boolean;
  lineLoginReady: boolean;
  lineUserId: string | null;
  liffReady: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  membership: LightweightMembership | null;
  proCandidate: boolean;
  refresh: () => Promise<void>;
  state: LightweightIdentityState;
  unifiedIdentity: LightweightUnifiedIdentity | null;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

function deriveState(response: IdentityResponse | null): LightweightIdentityState {
  if (!response?.authenticated || !response.membership) {
    return "anonymous";
  }

  if (response.membership.plan === "enterprise") {
    return "enterprise";
  }

  if (response.membership.plan === "pro") {
    return "pro";
  }

  if (response.line_connected) {
    return "line_connected";
  }

  return "identified";
}

function toEventMembership(membership: LightweightMembership | null) {
  return membership?.plan ?? "anonymous";
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<IdentityResponse | null>(null);
  const [state, setState] = useState<LightweightIdentityState>("loading");
  const restoredTrackedRef = useRef(false);
  const lineLoginTrackedRef = useRef(false);

  const applyPayload = useCallback((nextPayload: IdentityResponse | null) => {
    setPayload(nextPayload);
    setState(deriveState(nextPayload));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });
      const nextPayload = (await response.json()) as IdentityResponse;

      applyPayload(nextPayload);

      if (nextPayload.authenticated && !restoredTrackedRef.current) {
        restoredTrackedRef.current = true;
        trackEvent("identity_session_restored", {
          membership: toEventMembership(nextPayload.membership ?? null),
          path: window.location.pathname,
          source: "identity_provider",
        });
        trackEvent("identified_return_visit", {
          membership: toEventMembership(nextPayload.membership ?? null),
          path: window.location.pathname,
          source: "identity_provider",
        });
        if (nextPayload.unified_identity) {
          trackEvent("unified_identity_restored", {
            line_connected: nextPayload.line_connected ?? false,
            membership: toEventMembership(nextPayload.membership ?? null),
            path: window.location.pathname,
            source: "identity_provider",
          });
        }
        if (nextPayload.line_connected && !lineLoginTrackedRef.current) {
          lineLoginTrackedRef.current = true;
          const params = new URLSearchParams(window.location.search);
          trackEvent(params.get("line_login") === "success" ? "line_login_success" : "liff_identity_restored", {
            line_connected: true,
            membership: toEventMembership(nextPayload.membership ?? null),
            path: window.location.pathname,
            source: params.get("line_login") === "success" ? "line_callback" : "identity_provider",
          });
        }
      }
    } catch {
      applyPayload(null);
    }
  }, [applyPayload]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(id);
  }, [refresh]);

  const identify = useCallback(
    async (email: string, source = "identity_surface") => {
      try {
        const response = await fetch("/api/auth/session", {
          body: JSON.stringify({
            email,
            path: window.location.pathname,
            source,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });
        const nextPayload = (await response.json()) as IdentityResponse;

        if (!response.ok || !nextPayload.authenticated) {
          return false;
        }

        applyPayload(nextPayload);
        trackEvent("identity_session_created", {
          membership: toEventMembership(nextPayload.membership ?? null),
          path: window.location.pathname,
          source,
        });

        return true;
      } catch {
        return false;
      }
    },
    [applyPayload],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      trackEvent("identity_session_cleared", {
        membership: toEventMembership(payload?.membership ?? null),
        path: window.location.pathname,
        source: "identity_status",
      });
      restoredTrackedRef.current = false;
      lineLoginTrackedRef.current = false;
      applyPayload(null);
    }
  }, [applyPayload, payload?.membership]);

  const value = useMemo<IdentityContextValue>(
    () => ({
      identify,
      identity: payload?.identity ?? null,
      intelligenceSyncReady: payload?.intelligence_sync_ready ?? false,
      lineDisplayName: payload?.line_display_name ?? null,
      lineConnected: payload?.line_connected ?? false,
      lineLoginReady: payload?.line_login_ready ?? false,
      lineUserId: payload?.line_user_id ?? null,
      liffReady: payload?.liff_ready ?? false,
      loading: state === "loading",
      logout,
      membership: payload?.membership ?? null,
      proCandidate: payload?.pro_candidate ?? false,
      refresh,
      state,
      unifiedIdentity: payload?.unified_identity ?? null,
    }),
    [identify, logout, payload, refresh, state],
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentitySession() {
  const value = useContext(IdentityContext);

  if (!value) {
    throw new Error("useIdentitySession must be used inside IdentityProvider");
  }

  return value;
}
