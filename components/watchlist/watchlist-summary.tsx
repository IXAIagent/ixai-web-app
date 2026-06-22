"use client";

import { useEffect, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";

function formatPrice(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    currency: currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: value >= 100 ? 2 : 4,
    style: "currency",
  }).format(value);
}

export function WatchlistSummary() {
  const [summary, setSummary] = useState<WorkspaceWatchlistSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    setSummary(await getWorkspaceWatchlistSummary());
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Eye} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Watchlist Engine
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Workspace watchlist readback
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Local/fallback watchlist items are matched with Market Service quotes when available. This is monitoring only, not a trade list.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "讀取中" : "重新整理"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Items", summary?.itemCount ?? "--"],
          ["Quoted", summary?.quotedItemCount ?? "--"],
          ["Unquoted", summary?.unquotedItemCount ?? "--"],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {summary?.items.map((item) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={item.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">
                  {item.symbol}
                </p>
                <p className="mt-1 text-sm text-[var(--ixai-forest-soft)]">
                  {item.name} · {item.assetType}
                </p>
              </div>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {item.sourceStatus}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">
              {formatPrice(item.quote?.quote?.price, item.quote?.quote?.currency)}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
              Quote status: {item.quote?.sourceStatus ?? "unavailable"}
            </p>
            {item.note ? (
              <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/60 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {item.note}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      {summary ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {summary.informationalOnlyDisclaimer}
        </p>
      ) : null}
    </section>
  );
}
