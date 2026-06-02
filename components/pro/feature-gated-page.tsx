"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LockedFeatureCard } from "@/components/pro/locked-feature-card";
import {
  canAccessFCN,
  canAccessPortfolio,
  canAccessRiskEngine,
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
}: {
  description: string;
  feature: FeatureKey;
  moduleName: string;
}) {
  const [entitlements, setEntitlements] = useState<IXAIEntitlements>(() =>
    normalizeEntitlements(null),
  );
  const [message, setMessage] = useState("Checking account entitlement...");
  const [plan, setPlan] = useState("free");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    async function loadEntitlements() {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        if (mounted) {
          setEntitlements(normalizeEntitlements(null));
          setMessage("Sign in and link your account before Pro access can be evaluated.");
          setPlan("free");
          setStatus("not_authenticated");
        }
        return;
      }

      const response = await fetch("/api/pro/entitlements", {
        cache: "no-store",
        headers,
      });
      const payload = (await response.json()) as EntitlementsResponse;

      if (!mounted) {
        return;
      }

      setEntitlements(normalizeEntitlements(payload.entitlements));
      setMessage(
        payload.message ??
          (payload.ok
            ? "Membership entitlement state is loaded from your IXAI App account."
            : "Sign in and link your account before Pro access can be evaluated."),
      );
      setPlan(payload.plan ?? "free");
      setStatus(payload.status);
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
  const stateLabel = enabled ? "Available" : "Reserved for Pro";
  const normalizedPlan = useMemo(() => plan.toUpperCase(), [plan]);

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
      </section>

      <section className="grid gap-3 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Current Plan
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
              {normalizedPlan}
            </p>
          </div>
          <span className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-white/60 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-forest)]">
            {stateLabel}
          </span>
        </div>

        <LockedFeatureCard
          description={`Required entitlement: ${featureLabels[feature]}. ${message}`}
          enabled={enabled}
          name={moduleName}
        />

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
          <ArrowLeft className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          Back to Account
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/pro"
        >
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          Explore Pro Preview
        </Link>
      </div>
    </main>
  );
}
