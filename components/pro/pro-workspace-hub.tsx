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

const LEGACY_PRO_LAB_LOGIN_URL = "https://ixai-website-clean.vercel.app/login";

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
          IXAI Pro Bridge
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-5xl">
          IXAI Pro connects the existing Pro Lab and the new App workspace.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
          The existing IXAI Pro Lab remains available for invited beta testers. The
          new in-app workspace stays as a beta area for Portfolio, FCN, and Risk
          skeletons while shared-login bridge work continues.
        </p>
        <p className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs leading-6 text-white/60">
          Legacy Pro Lab is a separate environment today. App account shared login
          is in progress; do not assume your app.ixuan.ai password works in the
          legacy lab unless you have assigned Pro Lab credentials.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(255,250,240,0.9)] p-4 shadow-[0_18px_56px_rgba(9,41,31,0.08)] sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
            A. Existing Pro Lab
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            Open the existing IXAI Pro Lab
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Use this path when you need the current legacy Pro dashboard. Shared
            login is not true SSO yet, so beta testers should use assigned Pro Lab
            credentials if available.
          </p>
          <a
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] sm:w-auto"
            href={LEGACY_PRO_LAB_LOGIN_URL}
            rel="noreferrer"
            target="_blank"
          >
            Open IXAI Pro Lab
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </a>
        </article>

        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
            B. In-App Beta Workspace
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            Test the new App workspace
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Authenticated and account-linked users can test skeleton workspaces
            inside app.ixuan.ai. No Stripe, broker connection, real holdings, or
            investment advice is enabled.
          </p>
        </article>
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
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-forest)]">
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
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
        Existing IXAI Pro Lab remains a separate preview environment. The new in-app
        workspace is available for beta testing only. There is no true SSO yet, no
        Stripe, broker connection, real Portfolio / FCN data, trading execution, or
        investment advice.
      </section>
    </div>
  );
}
