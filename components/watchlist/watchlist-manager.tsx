"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useIdentity } from "@/components/auth/auth-provider";
import {
  MARKET_DATA_DISCLAIMER,
  type MarketDataStatus,
  type MarketQuote,
  type MarketQuotesResponse,
} from "@/src/lib/market-data/types";
import { ixaiIdentity } from "@/src/lib/ixai/identity";
import {
  loadUserWatchlist,
} from "@/src/lib/personalization/persistence";
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
  real: "真實",
  realtime: "即時",
  delayed: "延遲",
  fallback: "參考",
  simulated: "參考",
  unavailable: "資料不可用",
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

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) {
    return "更新時間不明";
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "更新時間不明";
  }

  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function quoteForItem(item: WatchlistItem, quotes: Record<string, MarketQuote>) {
  return quotes[item.symbol] ?? quotes[displaySymbol(item)];
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
    if (session.mode !== "authenticated") {
      return;
    }

    let isMounted = true;

    async function loadAccountWatchlist() {
      const result = await loadUserWatchlist(session);

      if (!isMounted) {
        return;
      }

      if (result.status.mode === "synced") {
        setItems(result.items);
        setEditingNotes(
          Object.fromEntries(
            result.items.map((item) => [`${item.market}:${item.symbol}`, item.note ?? ""]),
          ),
        );
      }

      setManualSyncState({
        mode: result.status.mode === "synced" ? "synced" : "pending",
        label: result.status.label,
        message: result.status.message,
        lastSyncedAt: result.status.lastSyncedAt,
      });
    }

    void loadAccountWatchlist();

    return () => {
      isMounted = false;
    };
  }, [session]);

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          自選觀察
        </p>
        <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
          建立你的個人市場入口。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[rgba(245,240,230,0.72)] sm:mt-4 sm:text-base sm:leading-8">
          新增你關注的股票、ETF、指數或 Crypto。目前此裝置保存；登入後將逐步支援跨裝置同步，
          並為未來 IXAI Pro 個人監控建立基礎。
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-[rgba(245,240,230,0.58)] sm:mt-3 sm:text-sm sm:leading-7">
          {ixaiIdentity.watchlistSyncCopy}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap sm:gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-3 py-2 text-sm font-medium text-[#09291f] sm:px-4"
            href="/market"
            style={{ color: "#09291f" }}
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            查看市場總覽
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-[rgba(245,240,230,0.78)] transition hover:bg-white/8 hover:text-[var(--ixai-cream)] sm:px-4"
            href="/account"
          >
            <UserCircle className="h-4 w-4" aria-hidden="true" />
            前往我的 IXAI
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-3.5 text-sm leading-6 text-[var(--ixai-forest-soft)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              保存狀態
            </p>
            <p className="mt-1">
              {syncState.label} · {syncState.message}
            </p>
            <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
              {ixaiIdentity.sharedAccountMessage}
            </p>
            {syncState.lastSyncedAt ? (
              <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                上次同步：{new Date(syncState.lastSyncedAt).toLocaleString("zh-TW")}
              </p>
            ) : null}
          </div>
          {session.mode === "authenticated" ? (
            <button
              className="ixai-cta-forest inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium"
              onClick={handleAccountSync}
              type="button"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              同步到帳戶
            </button>
          ) : (
            <Link
              className="ixai-cta-forest inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium"
              href="/account"
            >
              <UserCircle className="h-4 w-4" aria-hidden="true" />
              登入同步
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-4 sm:p-6"
          onSubmit={handleSubmit}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            新增標的
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            新增觀察標的
          </h2>

          <div className="mt-4 grid gap-3.5 sm:mt-5 sm:gap-4">
            <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
              代號
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
            className="ixai-cta-forest mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45 sm:mt-5 sm:w-fit"
            disabled={!normalizedSymbol}
            type="submit"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            加入自選觀察
          </button>

          <div className="mt-4 border-t border-[var(--ixai-border)] pt-3.5 sm:mt-5 sm:pt-4">
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
          <div className="flex items-start justify-between gap-3 border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)]"
                onClick={() => sync(clearWatchlist())}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                清空
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="p-4 sm:p-6">
              <p className="text-lg font-semibold text-[var(--ixai-forest)]">
                新增第一個你關注的標的。
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                新增你關注的股票、ETF 或 Crypto，IXAI 將逐步建立你的個人市場觀察。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
                  href="/market"
                >
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  查看市場總覽
                </Link>
                <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
                  href="/account"
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  前往我的 IXAI
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--ixai-border)]">
              {items.map((item) => {
                const key = `${item.market}:${item.symbol}`;
                const quote = quoteForItem(item, quotes);
                const quoteUnavailable = !quote || quote.status === "unavailable";

                return (
                  <article className="p-4 sm:p-5" key={key}>
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
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)]"
                        onClick={() => handleRemove(item)}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
                        {quote ? statusLabels[quote.status] : "尚未載入"}
                      </span>
                    </div>

                    <div className="mt-3.5 grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3 sm:mt-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                          市場資料
                        </p>
                        <p className="mt-1 font-mono text-lg font-semibold text-[var(--ixai-forest)]">
                          {quoteUnavailable ? "資料暫不可用" : quote.price}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                          {quote
                            ? `${quote.sourceLabel} · ${statusLabels[quote.status]} · 更新 ${formatUpdatedAt(quote.updatedAt)}`
                            : "正在嘗試讀取 market quote"}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">
                        {quoteUnavailable ? "Unavailable" : quote.dailyChange}
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
                        className="ixai-cta-forest inline-flex w-fit items-center gap-1.5 rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-xs font-medium"
                        onClick={() => handleNoteSave(item)}
                        type="button"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
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
          自選觀察如何使用資料
        </p>
        <p className="mt-2">
          自選觀察會顯示每筆資料的狀態：真實、即時、延遲、參考或資料不可用。
          IXAI 會嘗試讀取公開市場資料；若資料來源暫時失敗，會以「參考」或「資料不可用」清楚標示。
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:px-4"
            href="/market"
          >
            查看市場總覽
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:px-4"
            href="/account"
          >
            前往我的 IXAI
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {MARKET_DATA_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
