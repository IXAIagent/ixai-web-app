"use client";

import { Activity, BellRing, BriefcaseBusiness, RadioTower } from "lucide-react";

import { buildBrokerHealthDiagnostics } from "@/src/lib/broker";
import { buildLiveProviderReadinessReport } from "@/src/lib/market-data/live-provider-readiness";
import { buildRiskAutomationReadinessReport } from "@/src/lib/risk/automation-readiness";
import { buildPortfolioLiveValuationReadiness } from "@/src/lib/valuation";

const modules = [
  {
    description: "Provider config, health, quote request/response, cache policy, and disabled-state model.",
    icon: RadioTower,
    label: "V21 Market Data Live Provider Readiness",
  },
  {
    description: "Future live quote snapshot input model for Portfolio, FCN, Risk, and Morning Brief.",
    icon: Activity,
    label: "V22 Portfolio Live Valuation Readiness",
  },
  {
    description: "Broker provider interface and manual placeholder. Live API, sync, and trading are disabled.",
    icon: BriefcaseBusiness,
    label: "V23 Broker Integration Foundation",
  },
  {
    description: "Risk rule, trigger, alert-evaluation, and snapshot-comparison readiness with automation disabled.",
    icon: BellRing,
    label: "V24 Risk Automation Readiness",
  },
];

export function ProgramBLivePlatformStatus({ compact = false }: { compact?: boolean }) {
  const market = buildLiveProviderReadinessReport();
  const valuation = buildPortfolioLiveValuationReadiness();
  const broker = buildBrokerHealthDiagnostics();
  const automation = buildRiskAutomationReadinessReport();
  const flags = market.safetyFlags;

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Program B · V21-V24 Live Platform
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            Live platform readiness
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Program B prepares contracts for live market data, valuation snapshots, broker sync,
            and risk automation. It remains read-only: no external fetch, no broker live API,
            no scheduler, no sender, no AI provider, no database write, and no trading logic.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          All live actions disabled
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
                  Disabled
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
          V21 providers: {market.configs.map((provider) => provider.label).join(", ")} all disabled.
        </p>
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V22 quote status: {valuation.quoteStatus}; source {valuation.sourceStatus}.
        </p>
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V23 broker live API = {String(broker.safetyFlags.brokerLiveApiEnabled)};
          position sync = {String(broker.syncReadiness.positionSyncEnabled)}.
        </p>
        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3">
          V24 scheduler = {String(automation.safetyFlags.schedulerEnabled)};
          sender = {String(automation.safetyFlags.notificationSenderEnabled)}.
        </p>
      </div>

      <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Safety flags: readOnly {String(flags.readOnly)}, externalFetch {String(flags.externalFetchEnabled)},
        market live API {String(flags.marketDataLiveApiEnabled)}, broker live API {String(flags.brokerLiveApiEnabled)},
        trading {String(flags.tradingEnabled)}, order execution {String(flags.orderExecutionEnabled)},
        AI provider {String(flags.aiProviderEnabled)}, recommendations {String(flags.recommendationLogicEnabled)}.
      </p>
    </section>
  );
}
