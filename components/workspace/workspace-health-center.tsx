"use client";

import { useRef, useState } from "react";
import { Globe2, HeartPulse, RefreshCw, ShieldCheck } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { useLocalization, useTranslation } from "@/src/lib/i18n";
import { getWorkspaceHealthScore, type WorkspaceHealthScore } from "@/src/lib/workspace/health";
import { getClientSafeMarketCacheSnapshot, getClientSafeMarketReadiness } from "@/src/lib/market/client-safe-market-readiness";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

type HealthStatus = "blocked" | "partial" | "ready" | "unknown";

type HealthItem = {
  detail: string;
  detailKey?: string;
  label: string;
  labelKey?: string;
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
      detail: "",
      detailKey: "binancePending",
      label: "",
      labelKey: "binanceStatus",
      status: "unknown",
    },
    yahoo: {
      detail: "",
      detailKey: "yahooPending",
      label: "",
      labelKey: "yahooStatus",
      status: "unknown",
    },
  };
}

async function probeLiveQuoteRoute(t: (key: string, fallback?: string) => string): Promise<LiveQuoteProbe> {
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
          ? t("liveQuoteSuccess")
              .replace("{symbol}", "BTCUSDT")
              .replace("{status}", binance?.sourceStatus ?? "unavailable")
          : t("liveQuoteFailed"),
        label: t("binanceStatus"),
        status: response.ok && payload.ok ? statusFromSource(binance?.sourceStatus) : "blocked",
      },
      yahoo: {
        detail: response.ok && payload.ok
          ? t("liveQuoteSuccess")
              .replace("{symbol}", "AAPL")
              .replace("{status}", yahoo?.sourceStatus ?? "unavailable")
          : t("liveQuoteFailed"),
        label: t("yahooStatus"),
        status: response.ok && payload.ok ? statusFromSource(yahoo?.sourceStatus) : "blocked",
      },
    };
  } catch {
    return {
      binance: {
        detail: t("quoteProbeFailed"),
        label: t("binanceStatus"),
        status: "blocked",
      },
      yahoo: {
        detail: t("quoteProbeFailed"),
        label: t("yahooStatus"),
        status: "blocked",
      },
    };
  }
}

export function WorkspaceHealthCenter() {
  const { t } = useTranslation("health");
  const { t: tDisclaimer } = useTranslation("disclaimers");
  const { t: tStatus } = useTranslation("status");
  const { currency, examples, region, regionMetadata } = useLocalization();
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
          probeLiveQuoteRoute(t),
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
        ? t("portfolioHealthScore").replace("{score}", String(health.portfolioHealth))
        : t("portfolioHealthPending"),
      label: t("portfolioReadiness"),
      status: health ? (health.portfolioHealth >= 70 ? "ready" : "partial") : "unknown",
    },
    {
      detail: health
        ? t("fcnHealthScore").replace("{score}", String(health.fcnHealth))
        : t("fcnHealthPending"),
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
        ? t("dataQualityHealthScore").replace("{score}", String(health.dataQualityHealth))
        : t("dataQualityHealthPending"),
      label: t("dataQualitySummary"),
      status: health ? (health.dataQualityHealth >= 70 ? "ready" : "partial") : "unknown",
    },
    {
      detail: t("i18nDetail"),
      label: t("i18nStatus"),
      status: "ready",
    },
    {
      detail: t("localizationDetail")
        .replace("{region}", region)
        .replace("{currency}", currency)
        .replace("{currencyExample}", examples.currency)
        .replace("{dateExample}", examples.date),
      label: t("localizationStatus", "Region / currency localization"),
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
          <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">{t("internalRouteOnly")}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">{clientReadiness.summary}</p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{t("generated")}</p>
          <p className="mt-2 break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">{generatedAt ?? t("manualRefreshPending", "manual refresh pending")}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            {regionMetadata.defaultTimezone}
          </p>
        </article>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {healthItems.map((item) => (
          <article className={`rounded-xl border p-4 ${STATUS_CLASS[item.status]}`} key={item.label}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <FeatureIcon icon={item.status === "ready" ? ShieldCheck : Globe2} size="sm" shadow={false} />
                <div>
                  <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.labelKey ? t(item.labelKey, item.label) : item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.detailKey ? t(item.detailKey, item.detail) : item.detail}</p>
                </div>
              </div>
              <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/65 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {tStatus(item.status, item.status)}
              </span>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {tDisclaimer("healthReadOnly")}
      </p>
    </section>
  );
}
