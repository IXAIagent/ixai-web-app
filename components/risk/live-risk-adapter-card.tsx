"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { getWorkspaceLegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import {
  buildLegacyLiveRiskAdapterSnapshot,
  type LegacyLiveRiskAdapterSnapshot,
} from "@/src/lib/risk/legacy-risk-engine/live-risk-adapter";
import { loadWorkspaceLiveValuationPreview } from "@/src/lib/valuation/live-valuation-client";

type LoadState = "error" | "loading" | "ready";

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
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

export function LiveRiskAdapterCard() {
  const [snapshot, setSnapshot] = useState<LegacyLiveRiskAdapterSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const loadSnapshot = useCallback(async () => {
    setLoadState("loading");
    try {
      const [legacyRiskSnapshot, livePreview] = await Promise.all([
        getWorkspaceLegacyRiskEngineSnapshot(),
        loadWorkspaceLiveValuationPreview(),
      ]);
      setSnapshot(
        buildLegacyLiveRiskAdapterSnapshot({
          fcn: livePreview.fcn,
          legacyRiskSnapshot,
          portfolio: livePreview.portfolio,
          quoteSnapshot: livePreview.quoteSnapshot,
        }),
      );
      setLoadState("ready");
    } catch {
      setSnapshot(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSnapshot();
    });
  }, [loadSnapshot]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Live Risk Adapter
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <ShieldAlert className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            V15 Risk + Yahoo Snapshot
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Reuses V15 Legacy Risk Engine output and overlays quote freshness metadata. No second risk engine, trading action, or recommendation logic is introduced.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          disabled={loadState === "loading"}
          onClick={() => void loadSnapshot()}
          type="button"
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          )}
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Risk Level", snapshot?.riskLevel ?? "--"],
          ["Data Quality", snapshot?.dataQuality ?? "--"],
          ["Portfolio Value", formatMoney(snapshot?.portfolioCurrentValue)],
          ["Live Warnings", String(snapshot?.liveWarningCount ?? 0)],
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

      <p className="mt-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Source: {snapshot?.source ?? "yahoo_live_preview"} · As of:{" "}
        {formatDateTime(snapshot?.marketAsOf)} · Read-only: {String(snapshot?.readOnly ?? true)} ·
        Trading actions: off · Recommendation logic: off · Missing quotes:{" "}
        {snapshot?.missingQuoteSymbols.length ?? 0}
      </p>

      {loadState === "error" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
          Live risk adapter could not be loaded. Existing Risk Center readback remains available.
        </p>
      ) : null}
    </section>
  );
}
