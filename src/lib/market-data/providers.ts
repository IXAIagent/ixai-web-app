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
};

function formatUsd(value?: number) {
  if (typeof value !== "number") {
    return "暫無資料";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
    style: "currency",
  }).format(value);
}

function formatChange(value?: number) {
  if (typeof value !== "number") {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
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

    const ids = supportedSymbols.map((symbol) => coinGeckoIds[symbol].id).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
      {
        headers: {
          accept: "application/json",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko request failed: ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoSimplePrice;

    return supportedSymbols.map((symbol) => {
      const meta = coinGeckoIds[symbol];
      const item = data[meta.id];
      const change = item?.usd_24h_change;

      if (!item?.usd) {
        return getFallbackMarketQuote(symbol);
      }

      return {
        symbol,
        name: meta.name,
        price: formatUsd(item.usd),
        dailyChange: formatChange(change),
        direction: directionFromChange(change),
        source: "coingecko",
        sourceLabel: "CoinGecko",
        status: "delayed",
        updatedAt: item.last_updated_at
          ? new Date(item.last_updated_at * 1000).toISOString()
          : new Date().toISOString(),
      } satisfies MarketQuote;
    });
  },
};

export const yahooStyleProviderPlaceholder: MarketQuoteProvider = {
  id: "yahoo-style-placeholder",
  label: "Yahoo-style Provider Placeholder",
  supports(symbol) {
    return ["SPY", "QQQ", "NVDA", "TSMC"].includes(normalizeMarketSymbol(symbol));
  },
  async getQuotes(symbols) {
    return getFallbackMarketQuotes(symbols);
  },
};

export const taiwanStockProviderPlaceholder: MarketQuoteProvider = {
  id: "taiwan-stock-placeholder",
  label: "Taiwan Stock Provider Placeholder",
  supports(symbol) {
    const normalized = normalizeMarketSymbol(symbol);
    return normalized === "2330" || normalized.endsWith(".TW");
  },
  async getQuotes(symbols) {
    return getFallbackMarketQuotes(symbols);
  },
};

export const fallbackMockProvider: MarketQuoteProvider = {
  id: "fallback-mock",
  label: "Fallback Mock Provider",
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

  requestedSymbols.forEach((symbol) => {
    if (!quotesBySymbol.has(symbol)) {
      quotesBySymbol.set(symbol, getFallbackMarketQuote(symbol));
    }
  });

  return requestedSymbols.map((symbol) => quotesBySymbol.get(symbol) ?? getFallbackMarketQuote(symbol));
}
