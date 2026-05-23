"use client";

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveResource } from "@/src/hooks/use-live-resource";
import {
  MARKET_DATA_DISCLAIMER,
  type MarketDataStatus,
  type MarketQuote,
  type MarketQuotesResponse,
} from "@/src/lib/market-data/types";
import {
  type WatchlistItem,
  type WatchlistMarket,
} from "@/src/lib/watchlist";
import { ensureDefaultWatchlistSeed } from "@/src/lib/watchlist-defaults";

const TEASER_LIMIT = 3;

const statusLabels: Record<MarketDataStatus, string> = {
  real: "真實",
  realtime: "即時",
  delayed: "延遲",
  fallback: "參考",
  simulated: "參考",
  unavailable: "資料不可用",
};

const marketLabels: Record<WatchlistMarket, string> = {
  US: "US",
  TW: "TW",
  Crypto: "CRYPTO",
  Global: "MACRO",
};

function withTwSuffix(item: WatchlistItem): string {
  if (item.market === "TW" && /^\d{4}$/.test(item.symbol)) {
    return `${item.symbol}.TW`;
  }

  return item.symbol;
}

function quoteForItem(item: WatchlistItem, quotes: Record<string, MarketQuote>) {
  // v1.28.1 — try the stored symbol first, then the .TW-suffixed variant so
  // legacy storage rows that pre-date normalizeWatchlistSymbol still match
  // against provider-normalized response keys (e.g. 2330 vs 2330.TW).
  return quotes[item.symbol] ?? quotes[withTwSuffix(item)];
}

export function WatchlistTeaser() {
  // SSR-neutral state so hydration matches; defaults are seeded after mount.
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setItems(ensureDefaultWatchlistSeed());
      setHydrated(true);
    }, 0);

    function refresh() {
      setItems(ensureDefaultWatchlistSeed());
    }

    window.addEventListener("ixai-watchlist-change", refresh);

    return () => {
      window.clearTimeout(handle);
      window.removeEventListener("ixai-watchlist-change", refresh);
    };
  }, []);

  const displayItems = useMemo(() => items.slice(0, TEASER_LIMIT), [items]);
  const symbolsKey = useMemo(
    () => displayItems.map((item) => item.symbol).join(","),
    [displayItems],
  );

  const fetchQuotes = useCallback(
    async (signal: AbortSignal): Promise<MarketQuotesResponse> => {
      if (!symbolsKey) {
        return {
          quotes: [],
          disclaimer: MARKET_DATA_DISCLAIMER,
          requestedSymbols: [],
          generatedAt: new Date().toISOString(),
        };
      }

      const response = await fetch(`/api/market/quotes?symbols=${symbolsKey}`, { signal });

      if (!response.ok) {
        throw new Error("watchlist teaser refresh failed");
      }

      return (await response.json()) as MarketQuotesResponse;
    },
    [symbolsKey],
  );
  const getQuotesUpdatedAt = useCallback(
    (payload: MarketQuotesResponse) => payload.generatedAt,
    [],
  );
  const { data: quotesPayload } = useLiveResource({
    fetcher: fetchQuotes,
    getUpdatedAt: getQuotesUpdatedAt,
    refreshIntervalMs: 60_000,
  });

  // useLiveResource retains the last successful payload on error, so deriving
  // quotes directly preserves stale-while-revalidate behavior.
  const quotes = useMemo(() => {
    if (!quotesPayload) {
      return {} as Record<string, MarketQuote>;
    }

    return Object.fromEntries(quotesPayload.quotes.map((quote) => [quote.symbol, quote]));
  }, [quotesPayload]);

  if (!hydrated || displayItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <Eye className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              我的自選觀察
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              你目前關注的前 {displayItems.length} 個標的
            </p>
          </div>
        </div>
        <Link
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-medium text-[var(--ixai-forest)]"
          href="/watchlist"
        >
          管理
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        {displayItems.map((item) => {
          const quote = quoteForItem(item, quotes);
          const unavailable = !quote || quote.status === "unavailable";

          return (
            <Link
              className="flex flex-col gap-2 rounded-xl border border-[var(--ixai-border)] bg-white/55 p-3 transition active:scale-[0.995]"
              href="/watchlist"
              key={`${item.market}:${item.symbol}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                    {item.symbol}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--ixai-ink-muted)]">
                    {item.name || item.symbol}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-[var(--ixai-border)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {marketLabels[item.market]}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {unavailable ? "—" : quote.price}
                </p>
                <p className="font-mono text-xs text-[var(--ixai-forest-soft)]">
                  {unavailable ? "Unavailable" : quote.dailyChange}
                </p>
              </div>
              <p className="text-[10px] leading-4 text-[var(--ixai-ink-muted)]">
                {quote ? statusLabels[quote.status] : "資料更新中"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
