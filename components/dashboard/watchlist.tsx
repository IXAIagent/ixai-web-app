"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useIdentity } from "@/components/auth/auth-provider";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import type {
  MarketDataStatus,
  MarketQuote,
  MarketQuotesResponse,
} from "@/src/lib/market-data/types";
import {
  getWatchlist,
  type WatchlistItem,
  type WatchlistMarket,
} from "@/src/lib/watchlist";

const statusLabels: Record<MarketDataStatus, string> = {
  real: "真實",
  realtime: "即時",
  delayed: "延遲",
  fallback: "Fallback",
  simulated: "模擬",
  unavailable: "暫無資料",
};

function displaySymbol(item: WatchlistItem) {
  if (item.market === "TW" && /^\d{4}$/.test(item.symbol)) {
    return `${item.symbol}.TW`;
  }

  return item.symbol;
}

function marketLabel(market: WatchlistMarket) {
  const labels: Record<WatchlistMarket, string> = {
    US: "美股",
    TW: "台股",
    Crypto: "Crypto",
    Global: "Global",
  };

  return labels[market];
}

function updatedLabel(quote?: MarketQuote) {
  if (!quote?.updatedAt) {
    return "Updated locally";
  }

  return "Updated now";
}

export function Watchlist() {
  const { session } = useIdentity();
  const [assets, setAssets] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});

  useEffect(() => {
    function syncWatchlist() {
      setAssets(getWatchlist().slice(0, 5));
    }

    const timeoutId = window.setTimeout(syncWatchlist, 0);
    window.addEventListener("storage", syncWatchlist);
    window.addEventListener("ixai-watchlist-change", syncWatchlist);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", syncWatchlist);
      window.removeEventListener("ixai-watchlist-change", syncWatchlist);
    };
  }, []);

  useEffect(() => {
    if (assets.length === 0) {
      return;
    }

    let isMounted = true;
    const symbols = assets.map((asset) => asset.symbol);

    async function loadQuotes() {
      try {
        const response = await fetch(`/api/market/quotes?symbols=${symbols.join(",")}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MarketQuotesResponse;
        if (!isMounted) {
          return;
        }

        setQuotes(
          Object.fromEntries(data.quotes.map((quote) => [quote.symbol, quote])),
        );
      } catch {
        if (isMounted) {
          setQuotes({});
        }
      }
    }

    loadQuotes();

    return () => {
      isMounted = false;
    };
  }, [assets]);

  return (
    <SectionCard>
      <SectionHeader action="Widget" eyebrow="自選觀察" title="個人市場雷達" />
      {assets.length === 0 ? (
        <div className="p-4 sm:p-5">
          <p className="text-base font-semibold leading-7 text-[var(--ixai-forest)]">
            新增你關注的股票、ETF 或 Crypto，IXAI 將逐步建立你的個人市場觀察。
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            Guest 會以本機保存；登入 IXAI account 後，watchlist 可接上未來跨裝置同步與個人 intelligence memory。
          </p>
          <Link
            className="mt-5 inline-flex rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
            href="/watchlist"
          >
            新增自選標的
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[var(--ixai-border)]">
          {assets.map((asset) => {
            const quote = quotes[asset.symbol];

            return (
              <article className="px-4 py-3.5 sm:px-5" key={`${asset.market}:${asset.symbol}`}>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">
                        {displaySymbol(asset)}
                      </p>
                      <span className="rounded-md border border-[var(--ixai-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--ixai-forest-soft)]">
                        {marketLabel(asset.market)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--ixai-ink-muted)]">
                      {asset.name}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-3 sm:block sm:text-right">
                    <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                      {quote?.dailyChange ?? "--"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--ixai-gold)]">
                      {quote ? statusLabels[quote.status] : "暫無資料"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {asset.note || "尚未新增備註。可在自選觀察頁補上你的觀察理由。"}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[var(--ixai-ink-muted)]">
                  <span>{updatedLabel(quote)}</span>
                  <span className="font-mono">{quote?.price ?? "暫無資料"}</span>
                </div>
              </article>
            );
          })}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Link
              className="inline-flex min-h-10 items-center rounded-lg border border-[var(--ixai-border)] px-4 text-sm font-medium text-[var(--ixai-forest)]"
              href="/watchlist"
            >
              管理自選觀察
            </Link>
            {/* v1.7: soft Pro seed inside the monitoring tier — no badge,
                no popup, just an inline reference. Premium conversion sits
                next to the workflow it upgrades. */}
            <Link
              className="text-xs text-[var(--ixai-ink-muted)] transition hover:text-[var(--ixai-forest)]"
              href={session.mode === "authenticated" ? ixaiEcosystem.proPreviewUrl : "/account"}
            >
              {session.mode === "authenticated"
                ? "Pro 用戶可監控更多標的、設定自訂提醒 →"
                : "登入後同步到你的 IXAI account →"}
            </Link>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
