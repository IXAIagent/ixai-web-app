"use client";

import { DirectionPill } from "@/components/dashboard/direction-pill";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import {
  defaultMarketSymbols,
  getFallbackMarketQuotes,
} from "@/src/lib/market-data/fallback";
import {
  MARKET_DATA_DISCLAIMER,
  type MarketDataStatus,
  type MarketQuote,
  type MarketQuotesResponse,
} from "@/src/lib/market-data/types";
import { useEffect, useMemo, useState } from "react";

const statusLabels: Record<MarketDataStatus, string> = {
  real: "真實",
  realtime: "即時",
  delayed: "延遲",
  fallback: "參考",
  simulated: "參考",
  unavailable: "資料不可用",
};

function formatUpdatedAt(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "更新時間不明";
  }

  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MarketOverview({
  symbols = defaultMarketSymbols,
}: {
  symbols?: string[];
}) {
  const initialQuotes = useMemo(
    () => getFallbackMarketQuotes(symbols).map((quote) => ({ ...quote, updatedAt: "" })),
    [symbols],
  );
  const [markets, setMarkets] = useState<MarketQuote[]>(initialQuotes);

  useEffect(() => {
    let isMounted = true;

    async function loadQuotes() {
      try {
        const response = await fetch(`/api/market/quotes?symbols=${symbols.join(",")}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MarketQuotesResponse;
        if (isMounted) {
          setMarkets(data.quotes);
        }
      } catch {
        if (isMounted) {
          setMarkets(initialQuotes);
        }
      }
    }

    loadQuotes();

    return () => {
      isMounted = false;
    };
  }, [initialQuotes, symbols]);

  return (
    <SectionCard>
      <SectionHeader action="資料狀態" eyebrow="市場總覽" title="核心資產追蹤" />
      <div className="grid gap-2.5 p-3.5 sm:grid-cols-2 sm:gap-3 sm:p-4 xl:grid-cols-1">
        {markets.map((asset) => (
          <div
            className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3.5 transition active:scale-[0.995] sm:p-4"
            key={asset.symbol}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {asset.symbol}
                </p>
                <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                  {asset.name}
                </p>
              </div>
              <DirectionPill direction={asset.direction} />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3 sm:mt-4">
              <p className="font-mono text-xl font-semibold text-[var(--ixai-forest)]">
                {asset.price}
              </p>
              <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">
                {asset.dailyChange}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-[var(--ixai-ink-muted)] sm:mt-4">
              <span className="rounded-md border border-[var(--ixai-border)] px-2 py-0.5 font-medium text-[var(--ixai-forest-soft)]">
                {statusLabels[asset.status]}
              </span>
              <span>{asset.sourceLabel}</span>
              <span suppressHydrationWarning>
                {asset.updatedAt ? `更新 ${formatUpdatedAt(asset.updatedAt)}` : "更新中"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-[var(--ixai-border)] px-4 py-3.5 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:px-5 sm:py-4">
        {MARKET_DATA_DISCLAIMER}
      </p>
    </SectionCard>
  );
}
