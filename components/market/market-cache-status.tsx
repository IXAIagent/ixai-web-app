import { DatabaseZap } from "lucide-react";

import type { MarketCacheSnapshot } from "@/src/lib/market/cache";

const CACHE_STATUS_CLASS = {
  fresh: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  stale: "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
  unavailable: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
};

function formatTimestamp(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

export function MarketCacheStatus({
  snapshot,
}: {
  snapshot: MarketCacheSnapshot;
}) {
  const visibleEntries = snapshot.entries.slice(0, 8);

  return (
    <article className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <DatabaseZap className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Market Cache Diagnostics
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
              Server-side market cache layer
            </h3>
          </div>
        </div>
        <span className="w-fit rounded-full border border-[var(--ixai-border)] bg-white/75 px-3 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
          Last refresh {formatTimestamp(snapshot.metadata.lastRefreshAt)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Entries", snapshot.metadata.entryCount],
          ["Fresh", snapshot.metadata.freshCount],
          ["Stale", snapshot.metadata.staleCount],
          ["Unavailable", snapshot.metadata.unavailableCount],
        ].map(([label, value]) => (
          <div
            className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleEntries.map((entry) => (
          <div
            className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3"
            key={`${entry.provider}:${entry.symbol}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                  {entry.provider}
                </p>
                <h4 className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                  {entry.symbol}
                </h4>
              </div>
              <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${CACHE_STATUS_CLASS[entry.status]}`}
              >
                {entry.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[var(--ixai-forest-soft)]">
              Cached {formatTimestamp(entry.cachedAt)} · Expires {formatTimestamp(entry.expiresAt)}
            </p>
          </div>
        ))}
        {visibleEntries.length === 0 ? (
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)] sm:col-span-2 xl:col-span-4">
            Market cache has no entries yet. Workspace quote requests will populate the memory cache when providers return or fail safely.
          </div>
        ) : null}
      </div>
    </article>
  );
}
