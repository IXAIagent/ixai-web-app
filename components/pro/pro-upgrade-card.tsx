"use client";

import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { ProFeature } from "@/src/lib/membership/entitlements";
import { getUpgradeReason } from "@/src/lib/membership/entitlements";

const featureCopy: Record<ProFeature, { title: string; copy: string }> = {
  ai_alerts: {
    title: "Turn market intelligence into AI risk alerts.",
    copy: "IXAI Pro will connect your watchlist and market memory to personal risk notifications.",
  },
  fcn_risk_intelligence: {
    title: "Bring FCN monitoring into your personal risk workspace.",
    copy: "Move from FCN education into worst-of, KI distance and coupon schedule monitoring.",
  },
  portfolio_intelligence: {
    title: "Make IXAI personal.",
    copy: "Portfolio Intelligence will connect market regime, concentration and watchlist behavior.",
  },
  premium_daily: {
    title: "Extend Daily Brief into a personal morning brief.",
    copy: "IXAI Pro will turn public intelligence into a workflow tailored to your assets.",
  },
  premium_weekly: {
    title: "Connect Weekly Intelligence to your own risk map.",
    copy: "IXAI Pro will turn weekly narrative into personal portfolio and FCN monitoring.",
  },
};

export function ProUpgradeCard({
  feature = "portfolio_intelligence",
  surface,
}: {
  feature?: ProFeature;
  surface: string;
}) {
  const reason = getUpgradeReason(feature);
  const copy = featureCopy[feature];

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]">
              Available in IXAI Pro
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-7">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/68">{copy.copy}</p>
          <p className="mt-2 text-xs leading-6 text-white/48">{reason.reason}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href={`/pro?feature=${encodeURIComponent(feature)}`}
            onClick={() =>
              trackEvent("pro_cta_click", {
                membership_plan: "free",
                path: typeof window !== "undefined" ? window.location.pathname : "",
                requested_feature: feature,
                surface,
              })
            }
          >
            Join Pro Waitlist
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/76"
            href="/pro-preview"
          >
            See sample Pro intelligence
          </Link>
        </div>
      </div>
    </section>
  );
}
