"use client";

import { BarChart3, Brain, BriefcaseBusiness, Newspaper } from "lucide-react";

import { buildMarketDataDiagnostics } from "@/src/lib/market-data";
import { buildMorningBriefDiagnostics } from "@/src/lib/morning-brief";
import { buildIntelligenceV2Diagnostics } from "@/src/lib/intelligence/v2";
import { getSaasFoundationReadiness } from "@/src/lib/saas-foundation";

const modules = [
  {
    description: "Provider interface and manual placeholder snapshot. No Yahoo, Binance, broker, or external market API.",
    icon: BarChart3,
    label: "V17 Market Data Provider Foundation",
    status: "Readiness",
  },
  {
    description: "Morning Brief accepts market snapshot metadata while news remains placeholder-only.",
    icon: Newspaper,
    label: "V18 Morning Brief Live Data Readiness",
    status: "Read-only",
  },
  {
    description: "Rule-based Intelligence v2 context layer. No LLM, no AI recommendation, no trading instruction.",
    icon: Brain,
    label: "V19 Intelligence Center v2 Foundation",
    status: "Read-only",
  },
  {
    description: "Plan, usage, subscription, and team readiness only. No billing provider or entitlement enforcement.",
    icon: BriefcaseBusiness,
    label: "V20 SaaS Foundation Readiness",
    status: "Preview",
  },
];

export function ProgramAProductLayerStatus({ compact = false }: { compact?: boolean }) {
  const marketDiagnostics = buildMarketDataDiagnostics();
  const morningDiagnostics = buildMorningBriefDiagnostics();
  const intelligenceDiagnostics = buildIntelligenceV2Diagnostics();
  const saasReadiness = getSaasFoundationReadiness();

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Program A · V17-V20 Product Layer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            Product foundation readiness
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Program A adds market-data provider contracts, Morning Brief live-data readiness,
            Intelligence v2 context, and SaaS readiness metadata. It is read-only and does not
            enable DB writes, external providers, AI, broker sync, scheduler, Telegram, billing,
            trading, or recommendations.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          External services off
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4"
              key={module.label}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
                  <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  {module.label}
                </span>
                <span className="rounded-full border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2 py-1 text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                  {module.status}
                </span>
              </div>
              {!compact ? (
                <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {module.description}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 text-xs leading-6 text-[var(--ixai-forest-soft)] sm:grid-cols-2 xl:grid-cols-4">
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V17: provider interface ready = {String(marketDiagnostics.providerInterfaceReady)};
          API calls = {String(marketDiagnostics.apiCallsEnabled)};
          external fetch = {String(marketDiagnostics.externalFetchEnabled)}.
        </p>
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V18: market input supported = {String(morningDiagnostics.marketDataInputSupported)};
          news placeholder = {String(morningDiagnostics.newsPlaceholderOnly)}.
        </p>
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V19: AI provider = {String(intelligenceDiagnostics.aiProviderEnabled)};
          recommendations = {String(intelligenceDiagnostics.recommendationLogicEnabled)}.
        </p>
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V20: billing provider = {String(saasReadiness.diagnostics.billingProviderEnabled)};
          subscription enforcement = {String(saasReadiness.diagnostics.subscriptionEnforcementEnabled)}.
        </p>
      </div>
    </section>
  );
}
