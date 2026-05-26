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
  line_connected?: boolean;
  membership?: LightweightMembership | null;
  ok?: boolean;
  pro_candidate?: boolean;
  unified_identity?: LightweightUnifiedIdentity | null;
};

type IdentityContextValue = {
  identify: (email: string, source?: string) => Promise<boolean>;
  identity: LightweightIdentity | null;
  intelligenceSyncReady: boolean;
  lineConnected: boolean;
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

  return "identified";
}

function toEventMembership(membership: LightweightMembership | null) {
  return membership?.plan ?? "anonymous";
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<IdentityResponse | null>(null);
  const [state, setState] = useState<LightweightIdentityState>("loading");
  const restoredTrackedRef = useRef(false);

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
      applyPayload(null);
    }
  }, [applyPayload, payload?.membership]);

  const value = useMemo<IdentityContextValue>(
    () => ({
      identify,
      identity: payload?.identity ?? null,
      intelligenceSyncReady: payload?.intelligence_sync_ready ?? false,
      lineConnected: payload?.line_connected ?? false,
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
