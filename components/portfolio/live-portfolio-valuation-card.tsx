"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, WalletCards } from "lucide-react";

import { useTranslation } from "@/src/lib/i18n/use-locale";
import { useWorkspaceDisplayLabels } from "@/src/lib/i18n/use-workspace-display-labels";
import { loadWorkspaceLiveValuationPreview } from "@/src/lib/valuation/live-valuation-client";
import type { PortfolioLiveValuationSnapshot } from "@/src/lib/valuation";

type LoadState = "error" | "loading" | "ready";

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatSignedMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return `${value >= 0 ? "+" : ""}${formatMoney(value)}`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function LivePortfolioValuationCard({ autoLoad = false }: { autoLoad?: boolean }) {
  const { t } = useTranslation("valuation");
  const { sourceStatusLabel } = useWorkspaceDisplayLabels();
  const [valuation, setValuation] = useState<PortfolioLiveValuationSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(autoLoad ? "loading" : "ready");

  const loadValuation = useCallback(async () => {
    setLoadState("loading");
    try {
      setValuation((await loadWorkspaceLiveValuationPreview()).portfolio);
      setLoadState("ready");
    } catch {
      setValuation(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    queueMicrotask(() => {
      void loadValuation();
    });
  }, [autoLoad, loadValuation]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            {t("livePreviewEyebrow")}
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <WalletCards className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            {t("livePreviewTitle")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {t("livePreviewBody")}
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          disabled={loadState === "loading"}
          onClick={() => void loadValuation()}
          type="button"
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          )}
          {t("refresh")}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [t("estimatedMarketValue"), formatMoney(valuation?.currentValue)],
          [t("costBasis"), formatMoney(valuation?.costBasis)],
          [t("unrealizedPnl"), formatSignedMoney(valuation?.unrealizedPnl)],
          ["P/L %", formatPercent(valuation?.unrealizedPnlPercent)],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 break-words font-mono text-lg font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <p className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("sourceStatus")}: <span className="font-semibold text-[var(--ixai-forest)]">{sourceStatusLabel(valuation?.dataQuality)}</span>
        </p>
        <p className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("missingQuotes")}: <span className="font-semibold text-[var(--ixai-forest)]">{valuation?.missingQuoteSymbols.length ?? 0}</span>
        </p>
        <p className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("manualFallback")}: <span className="font-semibold text-[var(--ixai-forest)]">{valuation?.manualFallbackSymbols.length ?? 0}</span>
        </p>
      </div>

      <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-white/55 p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {t("source")}: {valuation?.source ?? "live_market_preview"} · {t("asOf")}:{" "}
        {formatDateTime(valuation?.quoteSnapshot?.generatedAt)} · {t("staleQuotes")}:{" "}
        {valuation?.staleQuoteSymbols.length ?? 0}
      </p>

      {loadState === "error" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
          {t("noAdviceError")}
        </p>
      ) : !valuation ? (
        <p className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-white/55 p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("onDemandReady")}
        </p>
      ) : null}
    </section>
  );
}
