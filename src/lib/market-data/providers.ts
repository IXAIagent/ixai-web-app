import {
  getFallbackMarketQuote,
  getFallbackMarketQuotes,
  normalizeMarketSymbol,
} from "@/src/lib/market-data/fallback";
import type {
  MarketDirection,
  MarketQuote,
  MarketQuoteProvider,
  NewsProvider,
} from "@/src/lib/market-data/types";

type CoinGeckoSimplePrice = Record<
  string,
  {
    usd?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  }
>;

const coinGeckoIds: Record<string, { id: string; name: string }> = {
  BTC: { id: "bitcoin", name: "Bitcoin" },
  ETH: { id: "ethereum", name: "Ethereum" },
  SOL: { id: "solana", name: "Solana" },
};

const yahooSymbols: Record<string, { yahooSymbol: string; symbol: string; name: string }> = {
  "USDTWD=X": { yahooSymbol: "USDTWD=X", symbol: "USDTWD=X", name: "USD/TWD 美金兌台幣" },
  "GC=F": { yahooSymbol: "GC=F", symbol: "GC=F", name: "黃金期貨" },
  "SI=F": { yahooSymbol: "SI=F", symbol: "SI=F", name: "白銀期貨" },
  "^VIX": { yahooSymbol: "^VIX", symbol: "^VIX", name: "VIX 波動率指數" },
  "^TNX": { yahooSymbol: "^TNX", symbol: "^TNX", name: "美國 10 年期公債殖利率" },
  "DX-Y.NYB": { yahooSymbol: "DX-Y.NYB", symbol: "DX-Y.NYB", name: "DXY 美元指數" },
  SPY: { yahooSymbol: "SPY", symbol: "SPY", name: "S&P 500 ETF" },
  QQQ: { yahooSymbol: "QQQ", symbol: "QQQ", name: "Nasdaq 100 ETF" },
  NVDA: { yahooSymbol: "NVDA", symbol: "NVDA", name: "NVIDIA" },
  TSLA: { yahooSymbol: "TSLA", symbol: "TSLA", name: "Tesla" },
  AAPL: { yahooSymbol: "AAPL", symbol: "AAPL", name: "Apple" },
  MDB: { yahooSymbol: "MDB", symbol: "MDB", name: "MongoDB" },
  AFRM: { yahooSymbol: "AFRM", symbol: "AFRM", name: "Affirm" },
  MRVL: { yahooSymbol: "MRVL", symbol: "MRVL", name: "Marvell" },
  MSFT: { yahooSymbol: "MSFT", symbol: "MSFT", name: "Microsoft" },
  ORCL: { yahooSymbol: "ORCL", symbol: "ORCL", name: "Oracle" },
  AVGO: { yahooSymbol: "AVGO", symbol: "AVGO", name: "Broadcom" },
  PLTR: { yahooSymbol: "PLTR", symbol: "PLTR", name: "Palantir" },
  TSM: { yahooSymbol: "TSM", symbol: "TSM", name: "台積電 ADR" },
  TSMC: { yahooSymbol: "TSM", symbol: "TSM", name: "台積電 ADR" },
  "2330": { yahooSymbol: "2330.TW", symbol: "2330.TW", name: "台積電" },
  "2330.TW": { yahooSymbol: "2330.TW", symbol: "2330.TW", name: "台積電" },
  "2382.TW": { yahooSymbol: "2382.TW", symbol: "2382.TW", name: "廣達" },
  "3231.TW": { yahooSymbol: "3231.TW", symbol: "3231.TW", name: "緯創" },
  "2376.TW": { yahooSymbol: "2376.TW", symbol: "2376.TW", name: "技嘉" },
  "6669.TW": { yahooSymbol: "6669.TW", symbol: "6669.TW", name: "緯穎" },
  "3017.TW": { yahooSymbol: "3017.TW", symbol: "3017.TW", name: "奇鋐" },
  "3324.TW": { yahooSymbol: "3324.TW", symbol: "3324.TW", name: "雙鴻" },
  "2308.TW": { yahooSymbol: "2308.TW", symbol: "2308.TW", name: "台達電" },
  "2454.TW": { yahooSymbol: "2454.TW", symbol: "2454.TW", name: "聯發科" },
  "0050": { yahooSymbol: "0050.TW", symbol: "0050.TW", name: "元大台灣50" },
  "0050.TW": { yahooSymbol: "0050.TW", symbol: "0050.TW", name: "元大台灣50" },
};

type CachedQuoteEntry = {
  expiresAt: number;
  quote: MarketQuote;
};

type YahooChartResponse = {
  chart?: {
    result?: {
      meta?: {
        currency?: string;
        symbol?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
        exchangeTimezoneName?: string;
      };
      timestamp?: number[];
    }[];
    error?: unknown;
  };
};

const quoteCache = new Map<string, CachedQuoteEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedQuote(cacheKey: string) {
  const cached = quoteCache.get(cacheKey);

  if (!cached || cached.expiresAt < Date.now()) {
    quoteCache.delete(cacheKey);
    return undefined;
  }

  return cached.quote;
}

function setCachedQuote(cacheKey: string, quote: MarketQuote) {
  quoteCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    quote,
  });
}

function formatUsd(value?: number) {
  if (typeof value !== "number") {
    return "資料不可用";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
    style: "currency",
  }).format(value);
}

function formatPrice(value: number | undefined, currency = "USD") {
  if (typeof value !== "number") {
    return "資料不可用";
  }

  if (currency === "TWD") {
    return `NT$${new Intl.NumberFormat("zh-TW", {
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value)}`;
  }

  if (currency === "USD") {
    return formatUsd(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
}

function formatChange(value?: number) {
  if (typeof value !== "number") {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatIndexValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 2 : 2,
  }).format(value);
}

function directionFromChange(value?: number): MarketDirection {
  if (typeof value !== "number" || Math.abs(value) < 0.05) {
    return "flat";
  }

  return value > 0 ? "up" : "down";
}

export const coinGeckoProvider: MarketQuoteProvider = {
  id: "coingecko",
  label: "CoinGecko",
  supports(symbol) {
    return normalizeMarketSymbol(symbol) in coinGeckoIds;
  },
  async getQuotes(symbols) {
    const supportedSymbols = symbols
      .map(normalizeMarketSymbol)
      .filter((symbol) => symbol in coinGeckoIds);

    if (supportedSymbols.length === 0) {
      return [];
    }

    const cachedQuotes: MarketQuote[] = [];
    const symbolsToFetch = supportedSymbols.filter((symbol) => {
      const cached = getCachedQuote(`coingecko:${symbol}`);

      if (cached) {
        cachedQuotes.push(cached);
        return false;
      }

      return true;
    });

    if (symbolsToFetch.length === 0) {
      return cachedQuotes;
    }

    const ids = symbolsToFetch.map((symbol) => coinGeckoIds[symbol].id).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
      {
        headers: {
          accept: "application/json",
        },
        next: { revalidate: 600 },
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko request failed: ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoSimplePrice;

    const fetchedQuotes = symbolsToFetch.map((symbol) => {
      const meta = coinGeckoIds[symbol];
      const item = data[meta.id];
      const change = item?.usd_24h_change;

      if (!item?.usd) {
        return getFallbackMarketQuote(symbol);
      }

      const quote = {
        symbol,
        name: meta.name,
        price: formatUsd(item.usd),
        dailyChange: formatChange(change),
        direction: directionFromChange(change),
        source: "coingecko",
        sourceLabel: "CoinGecko",
        status: "real",
        updatedAt: item.last_updated_at
          ? new Date(item.last_updated_at * 1000).toISOString()
          : new Date().toISOString(),
      } satisfies MarketQuote;

      setCachedQuote(`coingecko:${symbol}`, quote);
      return quote;
    });

    return [...cachedQuotes, ...fetchedQuotes];
  },
};

async function getYahooChartQuote(symbol: string) {
  const meta = yahooSymbols[symbol];

  if (!meta) {
    return undefined;
  }

  const cached = getCachedQuote(`yahoo:${meta.yahooSymbol}`);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(meta.yahooSymbol)}?range=2d&interval=1d`,
    {
      headers: {
        accept: "application/json",
        "user-agent": "IXAI-MarketData/1.0",
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!response.ok) {
    throw new Error(`Yahoo Finance chart request failed for ${meta.yahooSymbol}: ${response.status}`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const chart = data.chart?.result?.[0];
  const chartMeta = chart?.meta;
  const price = chartMeta?.regularMarketPrice;
  const previousClose = chartMeta?.previousClose ?? chartMeta?.chartPreviousClose;

  if (typeof price !== "number") {
    return undefined;
  }

  const changePercent =
    typeof previousClose === "number" && previousClose !== 0
      ? ((price - previousClose) / previousClose) * 100
      : undefined;
  const quote = {
    symbol: meta.symbol,
    name: meta.name,
    price: meta.symbol === "^TNX"
      ? `${(price > 20 ? price / 10 : price).toFixed(2)}%`
      : meta.symbol === "^VIX" || meta.symbol === "DX-Y.NYB"
        ? formatIndexValue(price)
        : formatPrice(price, chartMeta?.currency),
    dailyChange: formatChange(changePercent),
    direction: directionFromChange(changePercent),
    source: "yahoo-finance",
    sourceLabel: "Yahoo Finance",
    status: "delayed",
    updatedAt: chartMeta?.regularMarketTime
      ? new Date(chartMeta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
  } satisfies MarketQuote;

  setCachedQuote(`yahoo:${meta.yahooSymbol}`, quote);
  return quote;
}

export const yahooFinanceProvider: MarketQuoteProvider = {
  id: "yahoo-finance",
  label: "Yahoo Finance",
  supports(symbol) {
    return normalizeMarketSymbol(symbol) in yahooSymbols;
  },
  async getQuotes(symbols) {
    const supportedSymbols = symbols
      .map(normalizeMarketSymbol)
      .filter((symbol) => symbol in yahooSymbols);
    const settled = await Promise.allSettled(
      supportedSymbols.map((symbol) => getYahooChartQuote(symbol)),
    );

    return settled
      .map((result, index) =>
        result.status === "fulfilled" && result.value
          ? result.value
          : getFallbackMarketQuote(supportedSymbols[index]),
      )
      .filter((quote): quote is MarketQuote => Boolean(quote));
  },
};

export const fallbackMockProvider: MarketQuoteProvider = {
  id: "fallback-mock",
  label: "備援市場資料",
  supports() {
    return true;
  },
  async getQuotes(symbols) {
    return getFallbackMarketQuotes(symbols);
  },
};

export const newsProviderPlaceholder: NewsProvider = {
  id: "news-provider-placeholder",
  label: "News Provider Placeholder",
  status: "placeholder",
  description:
    "保留未來接入鉅亨、RSS 或其他合法新聞來源的位置；此版本不抓取或儲存新聞全文。",
};

export async function getMarketQuotes(symbols: string[]): Promise<MarketQuote[]> {
  const requestedSymbols = [...new Set(symbols.map(normalizeMarketSymbol).filter(Boolean))];
  const quotesBySymbol = new Map<string, MarketQuote>();

  const cryptoSymbols = requestedSymbols.filter((symbol) => coinGeckoProvider.supports(symbol));
  if (cryptoSymbols.length > 0) {
    try {
      const cryptoQuotes = await coinGeckoProvider.getQuotes(cryptoSymbols);
      cryptoQuotes.forEach((quote) => quotesBySymbol.set(quote.symbol, quote));
    } catch {
      cryptoSymbols.forEach((symbol) => quotesBySymbol.set(symbol, getFallbackMarketQuote(symbol)));
    }
  }

  const yahooQuoteSymbols = requestedSymbols.filter(
    (symbol) => !quotesBySymbol.has(symbol) && yahooFinanceProvider.supports(symbol),
  );

  if (yahooQuoteSymbols.length > 0) {
    try {
      const yahooQuotes = await yahooFinanceProvider.getQuotes(yahooQuoteSymbols);
      yahooQuotes.forEach((quote) => quotesBySymbol.set(quote.symbol, quote));
    } catch {
      yahooQuoteSymbols.forEach((symbol) => quotesBySymbol.set(symbol, getFallbackMarketQuote(symbol)));
    }
  }

  requestedSymbols.forEach((symbol) => {
    if (!quotesBySymbol.has(symbol)) {
      quotesBySymbol.set(symbol, getFallbackMarketQuote(symbol));
    }
  });

  return requestedSymbols.map((symbol) => quotesBySymbol.get(symbol) ?? getFallbackMarketQuote(symbol));
}
