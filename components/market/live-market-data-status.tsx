"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, SatelliteDish } from "lucide-react";

import { loadWorkspaceLiveValuationPreview } from "@/src/lib/valuation/live-valuation-client";
import type { LiveProductValuationPreview } from "@/src/lib/valuation";

type LoadState = "error" | "loading" | "ready";

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

export function LiveMarketDataStatus({ compact = false }: { compact?: boolean }) {
  const [preview, setPreview] = useState<LiveProductValuationPreview | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const loadPreview = useCallback(async () => {
    setLoadState("loading");
    try {
      setPreview(await loadWorkspaceLiveValuationPreview());
      setLoadState("ready");
    } catch {
      setPreview(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPreview();
    });
  }, [loadPreview]);

  const quoteSnapshot = preview?.quoteSnapshot ?? null;

  return (
    <section className={`rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] ${compact ? "sm:p-5" : "sm:p-6"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Live Product 1
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <SatelliteDish className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Yahoo Quote Status
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Read-only Yahoo quote preview with in-memory cache. Informational only; no DB write, broker action, order execution, or recommendation logic.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          disabled={loadState === "loading"}
          onClick={() => void loadPreview()}
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
          ["Source", quoteSnapshot?.source.toUpperCase() ?? "--"],
          ["Status", quoteSnapshot?.dataQuality ?? (loadState === "error" ? "unavailable" : "loading")],
          ["Quotes", String(quoteSnapshot?.quotes.length ?? 0)],
          ["Cache", quoteSnapshot?.cacheStatus ?? "--"],
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
        Updated: {formatDateTime(quoteSnapshot?.generatedAt)} · Missing quotes:{" "}
        {quoteSnapshot?.missingQuoteSymbols.length ?? 0} · Stale quotes:{" "}
        {quoteSnapshot?.staleQuoteSymbols.length ?? 0}
      </p>

      {loadState === "error" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
          Yahoo quote preview could not be loaded. Existing Workspace fallback readbacks remain available.
        </p>
      ) : null}
    </section>
  );
}
