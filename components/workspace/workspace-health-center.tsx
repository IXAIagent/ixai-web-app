"use client";

import { useRef, useState } from "react";
import { Globe2, HeartPulse, RefreshCw, ShieldCheck } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { useTranslation } from "@/src/lib/i18n";
import { getWorkspaceHealthScore, type WorkspaceHealthScore } from "@/src/lib/workspace/health";
import { getClientSafeMarketCacheSnapshot, getClientSafeMarketReadiness } from "@/src/lib/market/client-safe-market-readiness";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type HealthStatus = "blocked" | "partial" | "ready" | "unknown";

type HealthItem = {
  detail: string;
  label: string;
  status: HealthStatus;
};

type LiveQuoteProbe = {
  binance: HealthItem;
  yahoo: HealthItem;
};

type LiveQuotesApiResponse = {
  ok?: boolean;
  quotes?: Array<{
    requestedSymbol: string;
    sourceStatus: string;
    symbol: string;
  }>;
};

const STATUS_CLASS: Record<HealthStatus, string> = {
  blocked: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]",
  partial: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)]",
  ready: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)]",
  unknown: "border-[var(--ixai-border)] bg-white/70",
};

function statusFromSource(sourceStatus: string | undefined): HealthStatus {
  if (sourceStatus === "live" || sourceStatus === "delayed" || sourceStatus === "stale") return "ready";
  if (sourceStatus === "fallback" || sourceStatus === "partial") return "partial";
  if (sourceStatus === "unavailable") return "blocked";
  return "unknown";
}

function buildInitialProbe(): LiveQuoteProbe {
  return {
    binance: {
      detail: "Manual refresh has not checked BTCUSDT through the internal quote route yet.",
      label: "Binance status",
      status: "unknown",
    },
    yahoo: {
      detail: "Manual refresh has not checked AAPL through the internal quote route yet.",
      label: "Yahoo status",
      status: "unknown",
    },
  };
}

async function probeLiveQuoteRoute(): Promise<LiveQuoteProbe> {
  try {
    const response = await fetch("/api/market/live-quotes?symbols=AAPL,BTCUSDT", {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as LiveQuotesApiResponse;
    const quotes = payload.quotes ?? [];
    const yahoo = quotes.find((item) => item.requestedSymbol === "AAPL" || item.symbol === "AAPL");
    const binance = quotes.find((item) => item.requestedSymbol === "BTCUSDT" || item.symbol === "BTCUSDT");

    return {
      binance: {
        detail: response.ok && payload.ok
          ? `BTCUSDT returned ${binance?.sourceStatus ?? "unavailable"} through /api/market/live-quotes.`
          : "Internal live quote route did not return an ok payload for Binance probe.",
        label: "Binance status",
        status: response.ok && payload.ok ? statusFromSource(binance?.sourceStatus) : "blocked",
      },
      yahoo: {
        detail: response.ok && payload.ok
          ? `AAPL returned ${yahoo?.sourceStatus ?? "unavailable"} through /api/market/live-quotes.`
          : "Internal live quote route did not return an ok payload for Yahoo probe.",
        label: "Yahoo status",
        status: response.ok && payload.ok ? statusFromSource(yahoo?.sourceStatus) : "blocked",
      },
    };
  } catch {
    return {
      binance: {
        detail: "Internal quote route probe failed before returning a Binance result.",
        label: "Binance status",
        status: "blocked",
      },
      yahoo: {
        detail: "Internal quote route probe failed before returning a Yahoo result.",
        label: "Yahoo status",
        status: "blocked",
      },
    };
  }
}

export function WorkspaceHealthCenter() {
  const { t } = useTranslation("health");
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<WorkspaceHealthScore | null>(null);
  const [probe, setProbe] = useState<LiveQuoteProbe>(() => buildInitialProbe());
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const clientReadiness = getClientSafeMarketReadiness();
  const clientCache = getClientSafeMarketCacheSnapshot();

  async function refresh() {
    mountedRef.current = true;
    setIsLoading(true);
    const result = await runWorkspaceRuntimeBudget(
      "workspace-health-center-manual-refresh",
      async () => {
        const [healthResult, probeResult] = await Promise.allSettled([
          runWorkspaceSafe("workspace-health-center-score", getWorkspaceHealthScore, null),
          probeLiveQuoteRoute(),
        ]);

        return {
          health: healthResult.status === "fulfilled" ? healthResult.value.data : null,
          probe: probeResult.status === "fulfilled" ? probeResult.value : buildInitialProbe(),
        };
      },
      {
        health: null,
        probe: buildInitialProbe(),
      },
      { threshold: 2, timeoutMs: 5500 },
    );

    if (!mountedRef.current) return;
    setHealth(result.health);
    setProbe(result.probe);
    setGeneratedAt(new Date().toISOString());
    setIsLoading(false);
  }

  const healthItems: HealthItem[] = [
    probe.yahoo,
    probe.binance,
    {
      detail: clientCache.metadata.summary,
      label: t("quoteCacheStatus"),
      status: "partial",
    },
    {
      detail: health
        ? `Portfolio health score ${health.portfolioHealth}.`
        : "Manual refresh has not calculated portfolio valuation readiness yet.",
      label: t("portfolioReadiness"),
      status: health ? (health.portfolioHealth >= 70 ? "ready" : "partial") : "unknown",
    },
    {
      detail: health
        ? `FCN health score ${health.fcnHealth}.`
        : "Manual refresh has not calculated FCN live risk readiness yet.",
      label: t("fcnReadiness"),
      status: health ? (health.fcnHealth >= 70 ? "ready" : "partial") : "unknown",
    },
    {
      detail: t("morningBriefDetail"),
      label: t("morningBriefReadiness"),
      status: "ready",
    },
    {
      detail: t("runtimeDetail"),
      label: t("runtimeStatus"),
      status: "ready",
    },
    {
      detail: health
        ? `Data quality health score ${health.dataQualityHealth}.`
        : "Manual refresh has not calculated data quality summary yet.",
      label: t("dataQualitySummary"),
      status: health ? (health.dataQualityHealth >= 70 ? "ready" : "partial") : "unknown",
    },
    {
      detail: t("i18nDetail"),
      label: t("i18nStatus"),
      status: "ready",
    },
  ];

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={HeartPulse} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              {t("healthCenter")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? t("checking") : t("refresh")}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{t("overallHealth")}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-[var(--ixai-forest)]">{health?.overallHealth ?? "--"}</p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{t("marketApi")}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">Internal route only</p>
          <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">{clientReadiness.summary}</p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{t("generated")}</p>
          <p className="mt-2 break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">{generatedAt ?? "manual refresh pending"}</p>
        </article>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {healthItems.map((item) => (
          <article className={`rounded-xl border p-4 ${STATUS_CLASS[item.status]}`} key={item.label}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <FeatureIcon icon={item.status === "ready" ? ShieldCheck : Globe2} size="sm" shadow={false} />
                <div>
                  <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.detail}</p>
                </div>
              </div>
              <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {item.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Health Center is read-only. It does not run migrations, change auth/RLS, write data, activate scheduler/notifications, call AI models, or enable broker/trading/recommendation behavior.
      </p>
    </section>
  );
}
