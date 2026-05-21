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
  fallback: "備援",
  simulated: "模擬",
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
  const initialQuotes = useMemo(() => getFallbackMarketQuotes(symbols), [symbols]);
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
      <SectionHeader action="Market Data v1.5" eyebrow="市場總覽" title="核心資產追蹤" />
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
        {markets.map((asset) => (
          <div
            className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4"
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
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="font-mono text-xl font-semibold text-[var(--ixai-forest)]">
                {asset.price}
              </p>
              <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">
                {asset.dailyChange}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
              <span className="rounded-md border border-[var(--ixai-border)] px-2 py-0.5 font-medium text-[var(--ixai-forest-soft)]">
                {statusLabels[asset.status]}
              </span>
              <span>{asset.sourceLabel}</span>
              <span>更新 {formatUpdatedAt(asset.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-[var(--ixai-border)] px-5 py-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        {MARKET_DATA_DISCLAIMER}
      </p>
    </SectionCard>
  );
}
