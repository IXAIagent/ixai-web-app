export type WatchlistAssetType = "stock" | "crypto" | "index" | "etf";
export type WatchlistMarket = "US" | "TW" | "Crypto" | "Global";

export type WatchlistItem = {
  symbol: string;
  name: string;
  assetType: WatchlistAssetType;
  market: WatchlistMarket;
  note?: string;
  addedAt: string;
};

const WATCHLIST_STORAGE_KEY = "ixai.watchlist.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRawWatchlist(): WatchlistItem[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is WatchlistItem => {
      return (
        typeof item?.symbol === "string" &&
        typeof item?.name === "string" &&
        ["stock", "crypto", "index", "etf"].includes(item?.assetType) &&
        ["US", "TW", "Crypto", "Global"].includes(item?.market) &&
        typeof item?.addedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeWatchlist(items: WatchlistItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("ixai-watchlist-change"));
}

// v1.28.1 — robust normalization so dynamic symbols match what the quote
// provider returns. Rules:
//   - trim / strip whitespace
//   - uppercase
//   - Taiwan 4-digit codes get .TW suffix (so storage key matches provider key)
//   - existing .TW / .tw suffix is preserved
//   - crypto and other symbols pass through after uppercasing
export function normalizeWatchlistSymbol(
  symbol: string,
  market?: WatchlistMarket,
): string {
  const stripped = symbol.replace(/\s+/g, "");

  if (!stripped) {
    return "";
  }

  const upper = stripped.toUpperCase();

  if (market === "TW") {
    if (/^\d{4}$/.test(upper)) {
      return `${upper}.TW`;
    }

    if (/^\d{4}\.TW$/.test(upper)) {
      return upper;
    }
  }

  return upper;
}

// Kept for backward compatibility with existing call sites.
export function normalizeSymbol(symbol: string, market?: WatchlistMarket): string {
  return normalizeWatchlistSymbol(symbol, market);
}

export function getWatchlist(): WatchlistItem[] {
  return readRawWatchlist();
}

export function addWatchlistItem(
  item: Omit<WatchlistItem, "symbol" | "name" | "addedAt"> & {
    symbol: string;
    name?: string;
  },
): WatchlistItem[] {
  const symbol = normalizeSymbol(item.symbol, item.market);
  if (!symbol) {
    return getWatchlist();
  }

  const existing = getWatchlist();
  const nextItem: WatchlistItem = {
    symbol,
    name: item.name?.trim() || symbol,
    assetType: item.assetType,
    market: item.market,
    note: item.note?.trim() || undefined,
    addedAt: new Date().toISOString(),
  };

  const deduped = existing.filter(
    (current) => !(current.symbol === symbol && current.market === item.market),
  );
  const next = [nextItem, ...deduped];
  writeWatchlist(next);
  return next;
}

export function removeWatchlistItem(symbol: string, market?: WatchlistMarket): WatchlistItem[] {
  const normalized = normalizeSymbol(symbol, market);
  const next = getWatchlist().filter((item) => {
    if (market) {
      return !(item.symbol === normalized && item.market === market);
    }

    return item.symbol !== normalized;
  });
  writeWatchlist(next);
  return next;
}

export function updateWatchlistItem(
  symbol: string,
  updates: Partial<Omit<WatchlistItem, "symbol" | "addedAt">> & {
    market?: WatchlistMarket;
  },
): WatchlistItem[] {
  const normalized = normalizeSymbol(symbol, updates.market);
  const next = getWatchlist().map((item) => {
    const isMatch = updates.market
      ? item.symbol === normalized && item.market === updates.market
      : item.symbol === normalized;

    if (!isMatch) {
      return item;
    }

    return {
      ...item,
      ...updates,
      name: updates.name?.trim() || item.name,
      note: updates.note?.trim() || undefined,
    };
  });

  writeWatchlist(next);
  return next;
}

export function clearWatchlist(): WatchlistItem[] {
  writeWatchlist([]);
  return [];
}
