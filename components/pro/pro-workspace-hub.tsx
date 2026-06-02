"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, RadioTower, ShieldCheck } from "lucide-react";
import {
  applyBetaOpenAccess,
  canAccessFCN,
  canAccessPortfolio,
  canAccessRiskEngine,
  canUseBetaOpenAccess,
  normalizeEntitlements,
  type IXAIEntitlements,
} from "@/src/lib/pro/feature-gates";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";

type ProAccessResponse = {
  accountLink: {
    status: "not_started" | "linked" | "backend_not_configured" | "backend_contract_missing" | "error";
  };
  authenticated: boolean;
  ok: boolean;
};

type EntitlementsResponse = {
  entitlements?: IXAIEntitlements;
  ok: boolean;
  plan?: string;
  status: string;
};

type BackendHealth = {
  backendStatus?: string;
  ok: boolean;
};

const modules = [
  {
    copy: "Portfolio overview, allocation, positions, and AI portfolio notes in beta skeleton form.",
    href: "/portfolio",
    icon: BriefcaseBusiness,
    key: "portfolio",
    label: "Portfolio Intelligence",
  },
  {
    copy: "FCN holdings, coupon schedule, KI / KO watch, and worst-of monitor placeholders.",
    href: "/fcn",
    icon: ShieldCheck,
    key: "fcn",
    label: "FCN Monitoring",
  },
  {
    copy: "Portfolio risk, concentration risk, scenario monitor, and AI alert placeholders.",
    href: "/risk",
    icon: RadioTower,
    key: "risk",
    label: "Risk Engine",
  },
] as const;

export function ProWorkspaceHub() {
  const [accountLinkStatus, setAccountLinkStatus] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Checking");
  const [entitlements, setEntitlements] = useState<IXAIEntitlements>(() =>
    normalizeEntitlements(null),
  );
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    let mounted = true;

    async function loadWorkspaceState() {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        if (mounted) {
          setAuthenticated(false);
          setAccountLinkStatus(null);
          setEntitlements(normalizeEntitlements(null));
          setPlan("free");
        }
        return;
      }

      const healthResponse = await fetch("/api/backend/health", { cache: "no-store" }).catch(
        () => null,
      );
      const healthPayload = healthResponse
        ? ((await healthResponse.json().catch(() => ({}))) as BackendHealth)
        : null;

      if (mounted) {
        setBackendStatus(
          healthPayload?.ok ? `Connected (${healthPayload.backendStatus ?? "ok"})` : "Unavailable",
        );
      }

      const accessResponse = await fetch("/api/pro/access", {
        cache: "no-store",
        headers,
      });
      const accessPayload = (await accessResponse.json()) as ProAccessResponse;
      const entitlementResponse = await fetch("/api/pro/entitlements", {
        cache: "no-store",
        headers,
      });
      const entitlementPayload = (await entitlementResponse.json()) as EntitlementsResponse;
      const betaOpenAccess = canUseBetaOpenAccess({
        accountLinkStatus: accessPayload.accountLink?.status,
        authenticated: accessPayload.authenticated,
      });

      if (mounted) {
        setAuthenticated(accessPayload.authenticated === true);
        setAccountLinkStatus(accessPayload.accountLink?.status ?? null);
        setEntitlements(
          applyBetaOpenAccess(
            normalizeEntitlements(entitlementPayload.entitlements),
            betaOpenAccess,
          ),
        );
        setPlan(entitlementPayload.plan ?? "free");
      }
    }

    void loadWorkspaceState().catch(() => {
      if (mounted) {
        setBackendStatus("Unavailable");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const betaEnabled = canUseBetaOpenAccess({ accountLinkStatus, authenticated });
  const planLabel = `${plan.toUpperCase()}${betaEnabled ? " / BETA TESTER" : ""}`;
  const moduleAvailability = {
    fcn: canAccessFCN(entitlements),
    portfolio: canAccessPortfolio(entitlements),
    risk: canAccessRiskEngine(entitlements),
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ixai-gold)] sm:text-[11px]">
          IXAI Pro Workspace
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-5xl">
          Unified Pro Workspace
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
          The new IXAI Pro workspace now lives inside app.ixuan.ai. During beta,
          authenticated and account-linked users can enter Portfolio, FCN, and Risk
          workspace skeletons without Stripe, broker access, or real investment data.
        </p>
        <p className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs leading-6 text-white/60">
          Beta Open Access is temporary testing access. It is not permanent free Pro,
          paid entitlement, trading execution, or personalized investment advice.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["Beta Access", betaEnabled ? "Enabled" : authenticated ? "Connect account" : "Sign in"],
          ["Membership", planLabel],
          ["Backend", backendStatus],
        ].map(([label, value]) => (
          <article
            className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4"
            key={label}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              {label}
            </p>
            <p className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const available =
            module.key === "portfolio"
              ? moduleAvailability.portfolio
              : module.key === "fcn"
                ? moduleAvailability.fcn
                : moduleAvailability.risk;

          return (
            <article
              className="rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
              key={module.key}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.34)] bg-white/55 text-[var(--ixai-gold)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="rounded border border-emerald-700/20 bg-emerald-50/70 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-950">
                  {available ? "Beta Enabled" : "Connect Account"}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                {module.label}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {module.copy}
              </p>
              <Link
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
                href={module.href}
              >
                Open {module.label.replace(" Intelligence", "").replace(" Monitoring", "")}
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:p-5">
        Legacy Pro Lab is now reference-only for product history. The primary Pro
        workspace is inside app.ixuan.ai. No Stripe, broker connection, real Portfolio /
        FCN data, trading execution, or investment advice is enabled in this beta.
      </section>
    </div>
  );
}
