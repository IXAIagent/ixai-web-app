"use client";

import { Activity, Gauge, ShieldCheck } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  getClientSafeMarketReadiness,
  type ClientSafeMarketReadiness,
} from "@/src/lib/market/client-safe-market-readiness";

const MARKET_STATUS_CLASS = {
  disabled: "border-slate-200 bg-slate-50 text-slate-700",
  mock: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  placeholder: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  ready: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  unavailable: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
};

const PROVIDER_HEALTH_CLASS = {
  disabled: "border-slate-200 bg-slate-50 text-slate-700",
  healthy: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  mock: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  placeholder: "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  unavailable: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
};

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function MarketStatusBadge({
  status,
}: {
  status: keyof typeof MARKET_STATUS_CLASS;
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${MARKET_STATUS_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function ProviderHealthBadge({
  status,
}: {
  status: keyof typeof PROVIDER_HEALTH_CLASS;
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${PROVIDER_HEALTH_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export function WorkspaceMarketStatus({
  contextLabel,
  readback = getClientSafeMarketReadiness(),
}: {
  contextLabel: string;
  readback?: ClientSafeMarketReadiness;
}) {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={Gauge} shadow={false} />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Workspace Market Integration
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
            {contextLabel} Market Service Status
          </h2>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {readback.summary}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Providers", readback.readiness.providerCount],
          ["Quote Contracts", readback.readiness.quoteProviderCount],
          ["News Contracts", readback.readiness.newsProviderCount],
          ["Service Entrypoints", readback.serviceEntrypoints.length],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 break-words font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {typeof value === "number" ? formatNumber(value) : value}
            </p>
          </article>
        ))}
      </div>

      <article className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Workspace Market Quotes
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              Equity / Crypto quote foundation
            </h3>
          </div>
          <span className="w-fit rounded-full border border-[var(--ixai-border)] bg-white/75 px-3 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
            Browser fetch disabled
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
          Client-side direct Yahoo Finance requests are disabled. Live quote consumers must call
          the internal API route so Yahoo is fetched server-side and CORS errors cannot crash the browser.
        </p>
        <div className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          API route: <span className="font-mono">/api/market/yahoo-quotes?symbols=AAPL,MSFT</span>.
          This status card is readiness-only and performs no background quote fetch.
        </div>
        <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          Market data is informational only. IXAI does not provide buy/sell instructions, order execution, automatic trading, target prices, or return promises.
        </p>
      </article>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Market Readiness
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {readback.readiness.providers.map((provider) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3"
                key={provider.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                      {provider.id}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                      {provider.label}
                    </h3>
                  </div>
                  <MarketStatusBadge status={provider.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {provider.description}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Provider Health
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {readback.health.summary}
          </p>
          <div className="mt-4 grid gap-3">
            {readback.health.items.map((provider) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3"
                key={provider.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                      {provider.priority} / {provider.dataFreshness.replaceAll("_", " ")}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                      {provider.label}
                    </h3>
                  </div>
                  <ProviderHealthBadge status={provider.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {provider.summary}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Fallback Policy Awareness
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {readback.health.fallbackPolicy.reason}
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                Policy
              </p>
              <p className="mt-2 font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                {readback.health.fallbackPolicy.policy.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                Fallback Provider
              </p>
              <p className="mt-2 font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                {readback.health.fallbackPolicy.fallbackProviderId}
              </p>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            Read-only status metadata plus v4.20 public quote foundation. No broker feed, trading workflow, recommendation engine, or FCN pricing engine is enabled.
          </p>
        </article>
      </div>
    </section>
  );
}
