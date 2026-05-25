"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BarChart3, CalendarClock, Radar, ShieldCheck } from "lucide-react";
import { ProAlertPreview } from "@/components/pro/pro-alert-preview";
import { ProPreviewCard } from "@/components/pro/pro-preview-card";
import { ProRiskMap } from "@/components/pro/pro-risk-map";
import { ProWaitlistCta } from "@/components/pro/pro-waitlist-cta";
import { trackEvent } from "@/src/lib/analytics/analytics";

export function ProPreviewDashboard() {
  useEffect(() => {
    trackEvent("pro_preview_open", {
      path: window.location.pathname,
      surface: "pro_preview",
    });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Sample-only Pro Surface
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          IXAI Pro Preview Dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          A sample intelligence dashboard showing how future IXAI Pro members
          may monitor personal portfolio relevance, FCN risk, market memory and
          AI alerts. This preview uses sample data only.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ProPreviewCard
          eyebrow="Risk State"
          icon={ShieldCheck}
          note="Sample view: portfolio risk is elevated by AI concentration, not a trade recommendation."
          title="Portfolio risk state"
          value="Watch"
        />
        <ProPreviewCard
          eyebrow="Regime"
          icon={Radar}
          note="Market regime relevance is mapped to your future watchlist and exposure profile."
          title="Market regime relevance"
          value="Rates-sensitive"
        />
        <ProPreviewCard
          eyebrow="Watchlist"
          icon={BarChart3}
          note="Sample signal: semiconductor and AI server names dominate personal watch radar."
          title="Personal watchlist signal"
          value="AI supply chain"
        />
        <ProPreviewCard
          eyebrow="Next Window"
          icon={CalendarClock}
          note="Sample timing: macro data, earnings and FCN observation dates become one risk calendar."
          title="Next risk window"
          value="7 days"
        />
      </section>

      <ProRiskMap />

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          FCN Risk Intelligence Preview
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Worst-of monitor", "TSLA sample basket laggard"],
            ["KI distance", "Sample buffer: 18.4%"],
            ["KO / coupon calendar", "Next observation: sample 14 days"],
            ["Volatility sensitivity", "AI basket vol remains key input"],
          ].map(([label, value]) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-4" key={label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {label}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                {value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <ProAlertPreview />

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Upgrade Path
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            Join the Pro waitlist for future access.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            This dashboard is a sample preview. Future Pro access will require
            membership entitlement and human-safe risk controls. No payment is
            collected in this phase.
          </p>
          <Link
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
            href="/daily-brief"
          >
            Back to Public Intelligence
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ProWaitlistCta requestedFeature="portfolio_intelligence" surface="pro_preview" />
      </section>
    </div>
  );
}
