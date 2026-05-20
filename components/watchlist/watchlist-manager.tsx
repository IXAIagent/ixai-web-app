"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useIdentity } from "@/components/auth/auth-provider";
import {
  MARKET_DATA_DISCLAIMER,
  type MarketDataStatus,
  type MarketQuote,
  type MarketQuotesResponse,
} from "@/src/lib/market-data/types";
import {
  getWatchlistSyncState,
  syncWatchlistToAccount,
} from "@/src/lib/personalization/watchlist-sync";
import {
  addWatchlistItem,
  clearWatchlist,
  getWatchlist,
  normalizeSymbol,
  removeWatchlistItem,
  updateWatchlistItem,
  type WatchlistAssetType,
  type WatchlistItem,
  type WatchlistMarket,
} from "@/src/lib/watchlist";
import type { WatchlistSyncState } from "@/src/types/identity";

const assetTypeOptions: { label: string; value: WatchlistAssetType }[] = [
  { label: "股票", value: "stock" },
  { label: "Crypto", value: "crypto" },
  { label: "指數", value: "index" },
  { label: "ETF", value: "etf" },
];

const marketOptions: { label: string; value: WatchlistMarket }[] = [
  { label: "美股", value: "US" },
  { label: "台股", value: "TW" },
  { label: "Crypto", value: "Crypto" },
  { label: "Global", value: "Global" },
];

const exampleItems = [
  { symbol: "NVDA", name: "NVIDIA", assetType: "stock", market: "US" },
  { symbol: "2330", name: "台積電", assetType: "stock", market: "TW" },
  { symbol: "BTC", name: "Bitcoin", assetType: "crypto", market: "Crypto" },
] satisfies {
  symbol: string;
  name: string;
  assetType: WatchlistAssetType;
  market: WatchlistMarket;
}[];

const statusLabels: Record<MarketDataStatus, string> = {
  realtime: "即時",
  delayed: "延遲",
  simulated: "模擬",
  unavailable: "暫無資料",
};

function marketLabel(market: WatchlistMarket) {
  return marketOptions.find((item) => item.value === market)?.label ?? market;
}

function assetTypeLabel(assetType: WatchlistAssetType) {
  return assetTypeOptions.find((item) => item.value === assetType)?.label ?? assetType;
}

function displaySymbol(item: WatchlistItem) {
  if (item.market === "TW" && /^\d{4}$/.test(item.symbol)) {
    return `${item.symbol}.TW`;
  }

  return item.symbol;
}

export function WatchlistManager() {
  const { session, updateMemory } = useIdentity();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<WatchlistAssetType>("stock");
  const [market, setMarket] = useState<WatchlistMarket>("US");
  const [note, setNote] = useState("");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [manualSyncState, setManualSyncState] = useState<WatchlistSyncState | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const current = getWatchlist();
      setItems(current);
      setEditingNotes(
        Object.fromEntries(
          current.map((item) => [`${item.market}:${item.symbol}`, item.note ?? ""]),
        ),
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let isMounted = true;
    const symbols = items.map((item) => item.symbol);

    async function loadQuotes() {
      try {
        const response = await fetch(`/api/market/quotes?symbols=${symbols.join(",")}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MarketQuotesResponse;
        if (isMounted) {
          setQuotes(
            Object.fromEntries(data.quotes.map((quote) => [quote.symbol, quote])),
          );
        }
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
  }, [items]);

  const normalizedSymbol = useMemo(
    () => normalizeSymbol(symbol, market),
    [market, symbol],
  );
  const syncState = useMemo(
    () => manualSyncState ?? getWatchlistSyncState(session),
    [manualSyncState, session],
  );

  function sync(nextItems: WatchlistItem[]) {
    setItems(nextItems);
    setEditingNotes(
      Object.fromEntries(nextItems.map((item) => [`${item.market}:${item.symbol}`, item.note ?? ""])),
    );
    updateMemory({
      watchedSymbols: nextItems.map((item) => item.symbol),
    });
  }

  async function handleAccountSync() {
    setManualSyncState(await syncWatchlistToAccount(session, items));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedSymbol) {
      return;
    }

    sync(
      addWatchlistItem({
        symbol: normalizedSymbol,
        name,
        assetType,
        market,
        note,
      }),
    );
    setSymbol("");
    setName("");
    setNote("");
  }

  function addExample(example: (typeof exampleItems)[number]) {
    sync(addWatchlistItem(example));
  }

  function handleNoteSave(item: WatchlistItem) {
    const key = `${item.market}:${item.symbol}`;
    sync(updateWatchlistItem(item.symbol, { market: item.market, note: editingNotes[key] ?? "" }));
  }

  function handleRemove(item: WatchlistItem) {
    sync(removeWatchlistItem(item.symbol, item.market));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Personal Watchlist
        </p>
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-snug sm:text-4xl">
          建立你的個人市場入口。
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          新增你關注的股票、ETF、指數或 Crypto。Guest 先以 local-first
          保存；登入後可接上 IXAI account sync 與未來 Pro 監控。
        </p>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Personal Persistence
            </p>
            <p className="mt-1">
              {syncState.label} · {syncState.message}
            </p>
            {syncState.lastSyncedAt ? (
              <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                Last synced: {new Date(syncState.lastSyncedAt).toLocaleString("zh-TW")}
              </p>
            ) : null}
          </div>
          {session.mode === "authenticated" ? (
            <button
              className="w-fit rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
              onClick={handleAccountSync}
              type="button"
            >
              Sync to account
            </button>
          ) : (
            <Link
              className="w-fit rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
              href="/account"
            >
              登入同步
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-5 sm:p-6"
          onSubmit={handleSubmit}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Add Symbol
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            新增觀察標的
          </h2>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
              Symbol
              <input
                className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 font-mono text-sm outline-none transition focus:border-[var(--ixai-gold)]"
                onChange={(event) => setSymbol(event.target.value)}
                placeholder="NVDA / 2330 / BTC"
                value={symbol}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
              名稱（選填）
              <input
                className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ixai-gold)]"
                onChange={(event) => setName(event.target.value)}
                placeholder="NVIDIA / 台積電 / Bitcoin"
                value={name}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
                資產類型
                <select
                  className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ixai-gold)]"
                  onChange={(event) => setAssetType(event.target.value as WatchlistAssetType)}
                  value={assetType}
                >
                  {assetTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
                市場
                <select
                  className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ixai-gold)]"
                  onChange={(event) => setMarket(event.target.value as WatchlistMarket)}
                  value={market}
                >
                  {marketOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
              備註（選填）
              <textarea
                className="min-h-24 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm leading-7 outline-none transition focus:border-[var(--ixai-gold)]"
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：AI 算力主線、財報前觀察、ETF 資金流..."
                value={note}
              />
            </label>
          </div>

          <button
            className="mt-5 inline-flex rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!normalizedSymbol}
            type="submit"
          >
            加入自選觀察
          </button>

          <div className="mt-5 border-t border-[var(--ixai-border)] pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              範例
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {exampleItems.map((example) => (
                <button
                  className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2 text-xs font-medium text-[var(--ixai-forest)]"
                  key={`${example.market}:${example.symbol}`}
                  onClick={() => addExample(example)}
                  type="button"
                >
                  {example.symbol} / {example.name}
                </button>
              ))}
            </div>
          </div>
        </form>

        <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--ixai-border)] px-5 py-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Watchlist
              </p>
              <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
                目前自選清單
              </h2>
            </div>
            {items.length > 0 ? (
              <button
                className="rounded-lg border border-[var(--ixai-border)] px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)]"
                onClick={() => sync(clearWatchlist())}
                type="button"
              >
                清空
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="p-5 sm:p-6">
              <p className="text-lg font-semibold text-[var(--ixai-forest)]">
                新增第一個你關注的標的。
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                新增你關注的股票、ETF 或 Crypto，IXAI 將逐步建立你的個人市場觀察。
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--ixai-border)]">
              {items.map((item) => {
                const key = `${item.market}:${item.symbol}`;
                const quote = quotes[item.symbol];

                return (
                  <article className="p-5" key={key}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-base font-semibold text-[var(--ixai-forest)]">
                          {displaySymbol(item)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ixai-ink-muted)]">
                          {item.name}
                        </p>
                      </div>
                      <button
                        className="rounded-lg border border-[var(--ixai-border)] px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)]"
                        onClick={() => handleRemove(item)}
                        type="button"
                      >
                        移除
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--ixai-forest-soft)]">
                      <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                        {assetTypeLabel(item.assetType)}
                      </span>
                      <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                        {marketLabel(item.market)}
                      </span>
                      <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                        {new Date(item.addedAt).toLocaleDateString("zh-TW")}
                      </span>
                      <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                        {quote ? statusLabels[quote.status] : "暫無資料"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                          Market Data
                        </p>
                        <p className="mt-1 font-mono text-lg font-semibold text-[var(--ixai-forest)]">
                          {quote?.price ?? "暫無資料"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                          {quote?.sourceLabel ?? "Market Data Layer"}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">
                        {quote?.dailyChange ?? "--"}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <textarea
                        className="min-h-20 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm leading-7 outline-none transition focus:border-[var(--ixai-gold)]"
                        onChange={(event) =>
                          setEditingNotes((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        placeholder="新增此標的的觀察備註..."
                        value={editingNotes[key] ?? ""}
                      />
                      <button
                        className="w-fit rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-xs font-medium text-[var(--ixai-cream)]"
                        onClick={() => handleNoteSave(item)}
                        type="button"
                      >
                        儲存備註
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Market Data Layer
        </p>
        <p className="mt-2">
          自選觀察會顯示每筆資料的狀態：即時、延遲、模擬或暫無資料。BTC / ETH
          會嘗試讀取 CoinGecko，其餘標的目前以 provider placeholder 與 fallback mock
          維持穩定體驗。
        </p>
        <p className="mt-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {MARKET_DATA_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
