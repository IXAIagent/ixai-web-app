"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";

type BackendHealth = {
  ok: boolean;
  backendUrlConfigured: boolean;
  backendStatus: string;
  checkedAt: string;
  source: "ixai-backend";
};

type BackendUiState =
  | { label: "Checking"; tone: "pending"; detail: "Checking backend connection..." }
  | { label: "Connected"; tone: "ok"; detail: string }
  | { label: "Not configured"; tone: "muted"; detail: string }
  | { label: "Unavailable"; tone: "warning"; detail: string };

type ProAccess = {
  status: "not_connected" | "connected" | "preview" | "active" | "expired" | "revoked";
  canOpenPro: boolean;
  canUsePortfolio: boolean;
  canUseFCN: boolean;
  billingRequired: boolean;
  source: "supabase" | "manual" | "fallback";
  reason: string;
};

type ProAccessResponse = {
  accountLink: ProAccountLink;
  ok: boolean;
  authenticated: boolean;
  proAccess: ProAccess;
};

type ProAccountLink = {
  status:
    | "not_started"
    | "linked"
    | "backend_not_configured"
    | "backend_contract_missing"
    | "error";
  backendAccountId: string | null;
  requiresAction: boolean;
};

type AccountLinkResponse = {
  accountLink: ProAccountLink;
  message: string;
  ok: boolean;
  status: ProAccountLink["status"] | "not_authenticated";
};

type ProMembership = {
  accountId: string | null;
  planCode: "free" | "personal" | "pro" | "enterprise" | string;
  status: string;
  entitlements: Record<string, boolean>;
};

type ProMembershipResponse = {
  membership: ProMembership | null;
  message?: string;
  ok: boolean;
  status: "ok" | "not_authenticated" | "not_linked" | "backend_not_configured" | "error";
};

const IXAI_PRO_LAB_URL = "https://ixai-website-clean.vercel.app/";

function mapBackendState(health: BackendHealth | null, failed: boolean): BackendUiState {
  if (!health && !failed) {
    return {
      label: "Checking",
      tone: "pending",
      detail: "Checking backend connection...",
    };
  }

  if (!health || failed) {
    return {
      label: "Unavailable",
      tone: "warning",
      detail: "Backend health proxy could not reach IXAI backend.",
    };
  }

  if (health.ok) {
    return {
      label: "Connected",
      tone: "ok",
      detail: `IXAI backend responded: ${health.backendStatus}.`,
    };
  }

  if (!health.backendUrlConfigured) {
    return {
      label: "Not configured",
      tone: "muted",
      detail: "IXAI_BACKEND_URL is not configured for this environment.",
    };
  }

  return {
    label: "Unavailable",
    tone: "warning",
    detail: `IXAI backend status: ${health.backendStatus}.`,
  };
}

function toneClass(tone: BackendUiState["tone"]) {
  if (tone === "ok") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-900";
  }

  if (tone === "warning") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

function proAccessTone(status: ProAccess["status"] | "checking") {
  if (status === "active" || status === "preview") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-950";
  }

  if (status === "expired" || status === "revoked") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

function proAccessLabel(status: ProAccess["status"] | "checking") {
  const labels = {
    active: "Active",
    checking: "Checking",
    connected: "Connected",
    expired: "Expired",
    not_connected: "Not connected",
    preview: "Preview",
    revoked: "Revoked",
  };

  return labels[status];
}

function accountLinkTone(status: ProAccountLink["status"] | "checking") {
  if (status === "linked") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-950";
  }

  if (status === "backend_contract_missing" || status === "backend_not_configured") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  if (status === "error") {
    return "border-rose-700/20 bg-rose-50/75 text-rose-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

function accountLinkLabel(status: ProAccountLink["status"] | "checking") {
  const labels = {
    backend_contract_missing: "Backend contract pending",
    backend_not_configured: "Backend not configured",
    checking: "Checking",
    error: "Link unavailable",
    linked: "Linked",
    not_started: "Not started",
  };

  return labels[status];
}

function membershipLabel(membership: ProMembership | null) {
  if (!membership) {
    return "Not linked";
  }

  const labels: Record<string, string> = {
    enterprise: "Enterprise",
    free: "Free",
    personal: "Personal",
    pro: "Pro",
  };

  return labels[membership.planCode] ?? membership.planCode;
}

export function ProLabConnectionCard({
  source,
  showProAccess = false,
  showBackendStatus = false,
}: {
  source: "account" | "pro" | "pro_preview";
  showProAccess?: boolean;
  showBackendStatus?: boolean;
}) {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [failed, setFailed] = useState(false);
  const [proAccess, setProAccess] = useState<ProAccess | null>(null);
  const [proAccessFailed, setProAccessFailed] = useState(false);
  const [accountLink, setAccountLink] = useState<ProAccountLink | null>(null);
  const [accountLinkMessage, setAccountLinkMessage] = useState(
    "Checking backend account link status...",
  );
  const [accountLinkPending, setAccountLinkPending] = useState(false);
  const [membership, setMembership] = useState<ProMembership | null>(null);
  const [membershipMessage, setMembershipMessage] = useState("Membership not evaluated yet.");

  useEffect(() => {
    if (!showBackendStatus) {
      return;
    }

    let mounted = true;

    fetch("/api/backend/health", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as BackendHealth;
        if (mounted) {
          setHealth(payload);
          setFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setFailed(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [showBackendStatus]);

  useEffect(() => {
    if (!showProAccess) {
      return;
    }

    let mounted = true;

    async function loadAccess() {
      const authHeaders = await getSupabaseAuthorizationHeaders();
      const response = await fetch("/api/pro/access", {
        cache: "no-store",
        headers: authHeaders,
      });
      const payload = (await response.json()) as ProAccessResponse;

      if (mounted) {
        setAccountLink(payload.accountLink);
        setAccountLinkMessage(accountLinkMessageFromState(payload.accountLink));
        setProAccess(payload.proAccess);
        setProAccessFailed(false);
      }

      if (authHeaders && mounted) {
        const membershipResponse = await fetch("/api/pro/membership", {
          cache: "no-store",
          headers: authHeaders,
        });
        const membershipPayload = (await membershipResponse.json()) as ProMembershipResponse;

        if (mounted) {
          setMembership(membershipPayload.membership);
          setMembershipMessage(
            membershipPayload.ok
              ? "Linked account membership is entitlement-gated."
              : membershipPayload.message ?? "Membership lookup is pending account link.",
          );
        }
      }
    }

    void loadAccess().catch(() => {
      if (mounted) {
        setProAccessFailed(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [showProAccess]);

  const backend = mapBackendState(health, failed);
  const proStatus = proAccess?.status ?? "checking";
  const accountLinkStatus = accountLink?.status ?? "checking";
  const sourceLabel =
    source === "account" ? "Account" : source === "pro" ? "Pro" : "Pro Preview";
  const accessReason = proAccessFailed
    ? "Unable to verify Pro access. Safe fallback keeps paid features closed."
    : proAccess?.reason ?? "Checking Pro access identity bridge...";
  const canOpenPro = proAccess?.canOpenPro === true;
  const showAccountLink = source === "account" && showProAccess;
  const legacyLoginWarning =
    "IXAI Pro Lab is currently a separate preview environment. App account login is not yet shared with Pro Lab. Do not use your App password to log into Pro Lab unless you have a separate Pro Lab account.";

  async function handleConnectProAccount() {
    setAccountLinkPending(true);

    try {
      const authHeaders = await getSupabaseAuthorizationHeaders();
      const response = await fetch("/api/pro/account-link", {
        cache: "no-store",
        headers: authHeaders,
        method: "POST",
      });
      const payload = (await response.json()) as AccountLinkResponse;

      setAccountLink(payload.accountLink);
      setAccountLinkMessage(payload.message || accountLinkMessageFromState(payload.accountLink));

      if (payload.accountLink.status === "linked" && authHeaders) {
        const membershipResponse = await fetch("/api/pro/membership", {
          cache: "no-store",
          headers: authHeaders,
        });
        const membershipPayload = (await membershipResponse.json()) as ProMembershipResponse;

        setMembership(membershipPayload.membership);
        setMembershipMessage(
          membershipPayload.ok
            ? "Linked account membership is entitlement-gated."
            : membershipPayload.message ?? "Membership lookup is pending account link.",
        );
      }
    } catch {
      setAccountLink({
        backendAccountId: null,
        requiresAction: true,
        status: "error",
      });
      setAccountLinkMessage("Account link request could not be completed.");
    } finally {
      setAccountLinkPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI Pro Lab · {sourceLabel}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
            IXAI App 正在建立 Pro identity bridge。
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Portfolio, FCN, and risk intelligence are being integrated from IXAI Pro Lab.
            目前 Pro Lab 是獨立 preview environment，App account login is not yet shared
            with Pro Lab. Full account linking is coming in v1.51.2+.
          </p>
          <p className="mt-2 max-w-3xl rounded-lg border border-amber-700/20 bg-amber-50/80 px-3 py-2 text-xs leading-6 text-amber-950">
            {legacyLoginWarning}
          </p>
        </div>

        <div className="grid min-w-[210px] gap-2">
          {showProAccess ? (
            <div className={`rounded-lg border px-3 py-2 ${proAccessTone(proStatus)}`}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Pro Access
              </p>
              <p className="mt-1 text-sm font-semibold">{proAccessLabel(proStatus)}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{accessReason}</p>
              {proAccess?.billingRequired ? (
                <p className="mt-2 text-xs leading-5 opacity-80">
                  Billing will be required for full Pro access.
                </p>
              ) : null}
            </div>
          ) : null}

          {showBackendStatus ? (
            <div className={`rounded-lg border px-3 py-2 ${toneClass(backend.tone)}`}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                Backend
              </p>
              <p className="mt-1 text-sm font-semibold">{backend.label}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{backend.detail}</p>
            </div>
          ) : null}

          {showAccountLink ? (
            <div className={`rounded-lg border px-3 py-2 ${accountLinkTone(accountLinkStatus)}`}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Account Link
              </p>
              <p className="mt-1 text-sm font-semibold">{accountLinkLabel(accountLinkStatus)}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{accountLinkMessage}</p>
            </div>
          ) : null}

          {showAccountLink ? (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/50 px-3 py-2 text-[var(--ixai-forest)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                Membership
              </p>
              <p className="mt-1 text-sm font-semibold">{membershipLabel(membership)}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                {membershipMessage}
              </p>
              <div className="mt-2 grid gap-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {[
                  ["Daily Brief", membership?.entitlements.daily_brief],
                  ["Weekly Brief", membership?.entitlements.weekly_brief],
                  ["Watchlist", membership?.entitlements.watchlist],
                  ["Portfolio", membership?.entitlements.portfolio],
                  ["FCN Monitoring", membership?.entitlements.fcn_monitoring],
                  ["Risk Engine", membership?.entitlements.risk_engine],
                ].map(([label, enabled]) => (
                  <span className="flex items-center justify-between gap-2" key={String(label)}>
                    <span>{label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                      {enabled ? "Enabled" : "Locked"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
        {showAccountLink ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              accountLinkPending ||
              proStatus === "checking" ||
              proAccess?.status === "not_connected" ||
              accountLink?.status === "linked"
            }
            onClick={handleConnectProAccount}
            type="button"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            {accountLinkPending ? "Connecting..." : "Connect Pro Account"}
          </button>
        ) : null}
        {showProAccess && proAccess?.status === "not_connected" ? (
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/login"
          >
            Sign in to connect Pro
          </Link>
        ) : canOpenPro || !showProAccess ? (
          <a
            aria-label="Open Pro Lab preview in a separate environment"
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href={IXAI_PRO_LAB_URL}
            rel="noreferrer"
            target="_blank"
            title="Open Pro Lab preview in a separate environment"
          >
            <span>{canOpenPro ? "View Pro Lab Preview" : "Learn about Pro Integration"}</span>
            <ArrowUpRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </a>
        ) : (
          <div className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-center text-sm font-medium text-[var(--ixai-forest-soft)]">
            Pro access is reserved for preview / paid users
          </div>
        )}
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/pro"
        >
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          Explore Pro
        </Link>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        This connection layer does not load portfolio holdings, FCN positions, broker data,
        paid entitlement, or personalized recommendations. Connecting your account does not
        activate paid Pro access.
      </p>
    </section>
  );
}

function accountLinkMessageFromState(accountLink: ProAccountLink) {
  if (accountLink.status === "linked") {
    return "Your App identity has a backend account link. Paid Pro access remains entitlement-gated.";
  }

  if (accountLink.status === "backend_not_configured") {
    return "Backend not configured. Account linking cannot start in this environment.";
  }

  if (accountLink.status === "backend_contract_missing") {
    return "Backend contract pending. The account-link endpoint is not available yet.";
  }

  if (accountLink.status === "error") {
    return "Backend account link check returned an error.";
  }

  return "Connect your App identity before backend Pro access can be evaluated.";
}
