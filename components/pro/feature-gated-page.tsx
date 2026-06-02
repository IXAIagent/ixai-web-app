"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LockedFeatureCard } from "@/components/pro/locked-feature-card";
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

type FeatureKey = "portfolio" | "fcn_monitoring" | "risk_engine";

type EntitlementsResponse = {
  entitlements?: IXAIEntitlements;
  message?: string;
  ok: boolean;
  plan?: string;
  status: string;
};

type ProAccessResponse = {
  accountLink: {
    status: "not_started" | "linked" | "backend_not_configured" | "backend_contract_missing" | "error";
  };
  authenticated: boolean;
  ok: boolean;
};

type WorkspaceSection = {
  title: string;
  copy: string;
};

const featureLabels: Record<FeatureKey, string> = {
  fcn_monitoring: "FCN Monitoring",
  portfolio: "Portfolio Intelligence",
  risk_engine: "Risk Engine",
};

function canAccessFeature(feature: FeatureKey, entitlements: IXAIEntitlements) {
  if (feature === "portfolio") {
    return canAccessPortfolio(entitlements);
  }

  if (feature === "fcn_monitoring") {
    return canAccessFCN(entitlements);
  }

  return canAccessRiskEngine(entitlements);
}

export function FeatureGatedPage({
  description,
  feature,
  moduleName,
  sections,
}: {
  description: string;
  feature: FeatureKey;
  moduleName: string;
  sections: WorkspaceSection[];
}) {
  const [entitlements, setEntitlements] = useState<IXAIEntitlements>(() =>
    normalizeEntitlements(null),
  );
  const [accountLinkStatus, setAccountLinkStatus] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState("Checking account entitlement...");
  const [plan, setPlan] = useState("free");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    async function loadEntitlements() {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        if (mounted) {
          setAccountLinkStatus(null);
          setAuthenticated(false);
          setEntitlements(normalizeEntitlements(null));
          setMessage("Sign in and link your account before Pro access can be evaluated.");
          setPlan("free");
          setStatus("not_authenticated");
        }
        return;
      }

      const accessResponse = await fetch("/api/pro/access", {
        cache: "no-store",
        headers,
      });
      const accessPayload = (await accessResponse.json()) as ProAccessResponse;
      const response = await fetch("/api/pro/entitlements", {
        cache: "no-store",
        headers,
      });
      const payload = (await response.json()) as EntitlementsResponse;

      if (!mounted) {
        return;
      }

      const betaOpenAccess = canUseBetaOpenAccess({
        accountLinkStatus: accessPayload.accountLink?.status,
        authenticated: accessPayload.authenticated,
      });
      setAccountLinkStatus(accessPayload.accountLink?.status ?? null);
      setAuthenticated(accessPayload.authenticated === true);
      setEntitlements(applyBetaOpenAccess(normalizeEntitlements(payload.entitlements), betaOpenAccess));
      setMessage(
        betaOpenAccess
          ? "Beta Open Access is enabled for linked App accounts. This is not paid Pro access."
          : payload.message ??
              (payload.ok
                ? "Membership entitlement state is loaded from your IXAI App account."
                : "Connect Pro Account first before Beta access can be enabled."),
      );
      setPlan(payload.plan ?? "free");
      setStatus(betaOpenAccess ? "beta_linked" : payload.status);
    }

    void loadEntitlements().catch(() => {
      if (mounted) {
        setMessage("Unable to load entitlement state. Safe fallback keeps Pro modules locked.");
        setStatus("error");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const enabled = canAccessFeature(feature, entitlements);
  const betaEnabled = canUseBetaOpenAccess({ accountLinkStatus, authenticated });
  const stateLabel = enabled ? "Beta Enabled" : "Reserved for Pro";
  const normalizedPlan = useMemo(() => plan.toUpperCase(), [plan]);
  const gateInstruction = !authenticated
    ? "Sign in to access IXAI Pro Beta."
    : accountLinkStatus !== "linked"
      ? "Connect Pro Account first."
      : "Beta workspace is available.";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)] sm:text-[11px]">
          IXAI Pro Feature Gate
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-4xl">
          {moduleName}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">{description}</p>
        <p className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs leading-6 text-white/60">
          Beta Open Access lets authenticated, account-linked users test this workspace
          skeleton. It is not permanent free Pro, Stripe billing, broker access, or
          personalized investment advice.
        </p>
      </section>

      <section className="grid gap-3 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
              Current Plan
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
              {normalizedPlan}
              {betaEnabled ? " / Beta Tester" : ""}
            </p>
          </div>
          <span className="rounded-lg border border-[rgba(9,41,31,0.24)] bg-[var(--ixai-forest)] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-cream)]">
            {stateLabel}
          </span>
        </div>

        <LockedFeatureCard
          description={`Required entitlement: ${featureLabels[feature]}. ${message}`}
          enabled={enabled}
          name={moduleName}
        />

        {enabled ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sections.map((section) => (
              <article
                className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4"
                key={section.title}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                  Beta testing placeholder
                </p>
                <h2 className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {section.copy}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-amber-700/20 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
            {gateInstruction}
          </div>
        )}

        <p className="text-xs leading-6 text-[var(--ixai-ink-muted)]">
          Status: {status}. This page does not load portfolio holdings, FCN positions,
          broker data, payment state, trading instructions, or personalized investment advice.
        </p>
      </section>

      <div className="grid gap-2 sm:flex sm:flex-wrap">
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
          href="/account"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ixai-cream)]" aria-hidden="true" />
          Back to Account
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/pro"
        >
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-forest)]" aria-hidden="true" />
          Open Pro Workspace
        </Link>
      </div>
    </main>
  );
}
