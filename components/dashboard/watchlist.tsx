"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import {
  getWatchlist,
  type WatchlistItem,
  type WatchlistMarket,
} from "@/src/lib/watchlist";

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

export function Watchlist() {
  const [assets, setAssets] = useState<WatchlistItem[]>([]);

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

  return (
    <SectionCard>
      <SectionHeader action="Personal" eyebrow="自選觀察" title="我的市場入口" />
      {assets.length === 0 ? (
        <div className="p-5">
          <p className="text-base font-semibold leading-7 text-[var(--ixai-forest)]">
            新增你關注的股票、ETF 或 Crypto，IXAI 將逐步建立你的個人市場觀察。
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            目前先以本機 localStorage 保存，不需要登入，也不會串接真實價格。
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
          {assets.map((asset) => (
            <article className="px-5 py-4" key={`${asset.market}:${asset.symbol}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                    {displaySymbol(asset)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                    {asset.name}
                  </p>
                </div>
                <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1 text-xs font-medium text-[var(--ixai-forest-soft)]">
                  {marketLabel(asset.market)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {asset.note || "尚未新增備註。可在自選觀察頁補上你的觀察理由。"}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                個人自選
              </p>
            </article>
          ))}
          <div className="px-5 py-4">
            <Link
              className="inline-flex rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
              href="/watchlist"
            >
              管理自選觀察
            </Link>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
