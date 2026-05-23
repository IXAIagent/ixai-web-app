// v1.28 retention layer — first-visit seed for /watchlist.
// Keeps the storage shape compatible with the existing ixai.watchlist.v1 store
// (richer than the spec's flat {symbols} envelope) so no data migration runs.

import {
  getWatchlist,
  type WatchlistAssetType,
  type WatchlistItem,
  type WatchlistMarket,
} from "@/src/lib/watchlist";

export type WatchlistDefaultSeed = {
  symbol: string;
  name: string;
  assetType: WatchlistAssetType;
  market: WatchlistMarket;
};

export const WATCHLIST_DEFAULT_SEEDS: WatchlistDefaultSeed[] = [
  { symbol: "BTC", name: "Bitcoin", assetType: "crypto", market: "Crypto" },
  { symbol: "ETH", name: "Ethereum", assetType: "crypto", market: "Crypto" },
  { symbol: "SPY", name: "S&P 500 ETF", assetType: "etf", market: "US" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", assetType: "etf", market: "US" },
  { symbol: "NVDA", name: "NVIDIA", assetType: "stock", market: "US" },
  { symbol: "TSM", name: "TSMC ADR", assetType: "stock", market: "US" },
  { symbol: "2330.TW", name: "台積電", assetType: "stock", market: "TW" },
  { symbol: "0050.TW", name: "元大台灣50", assetType: "etf", market: "TW" },
];

export function buildDefaultWatchlistItems(now: string = new Date().toISOString()): WatchlistItem[] {
  return WATCHLIST_DEFAULT_SEEDS.map((seed) => ({
    symbol: seed.symbol,
    name: seed.name,
    assetType: seed.assetType,
    market: seed.market,
    addedAt: now,
  }));
}

// First-visit seed marker so we never re-seed after a user clears their list.
const SEED_MARKER_KEY = "ixai.watchlist.defaults_seeded_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function ensureDefaultWatchlistSeed(): WatchlistItem[] {
  if (!canUseStorage()) {
    return getWatchlist();
  }

  const existing = getWatchlist();

  if (existing.length > 0) {
    return existing;
  }

  if (window.localStorage.getItem(SEED_MARKER_KEY)) {
    // User has already seen the defaults at least once and chose to empty their
    // list; respect that and do not re-seed.
    return existing;
  }

  const seeded = buildDefaultWatchlistItems();

  try {
    window.localStorage.setItem("ixai.watchlist.v1", JSON.stringify(seeded));
    window.localStorage.setItem(SEED_MARKER_KEY, new Date().toISOString());
    window.dispatchEvent(new Event("ixai-watchlist-change"));
  } catch {
    // localStorage quota / privacy mode — fall back to in-memory defaults.
  }

  return seeded;
}
