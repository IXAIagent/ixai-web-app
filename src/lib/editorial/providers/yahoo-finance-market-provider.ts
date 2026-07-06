import type { EditorialProviderAdapter, EditorialRawStory } from "@/src/lib/editorial/providers/provider-types";

type YahooQuoteItem = {
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
  shortName?: string;
  symbol?: string;
};

type YahooQuotePayload = {
  quoteResponse?: {
    result?: YahooQuoteItem[];
  };
};

const MARKET_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^VIX", "BTC-USD", "ETH-USD", "NVDA", "TSM"];

function storyFromQuote(quote: YahooQuoteItem, index: number): EditorialRawStory | null {
  if (!quote.symbol) {
    return null;
  }

  const change = quote.regularMarketChangePercent;
  const direction =
    typeof change === "number" && Number.isFinite(change)
      ? change >= 0
        ? "up"
        : "down"
      : "mixed";
  const absChange =
    typeof change === "number" && Number.isFinite(change) ? `${Math.abs(change).toFixed(2)}%` : "limited";

  return {
    categories: quote.symbol.includes("VIX")
      ? ["macro_risk", "risk_volatility"]
      : quote.symbol.includes("BTC") || quote.symbol.includes("ETH")
        ? ["crypto"]
        : ["market_snapshot", "technology"],
    confidence: 0.66,
    id: `yahoo-finance-market-${quote.symbol}-${index}`,
    importance: quote.symbol.includes("VIX") ? 0.72 : 0.62,
    markets: quote.symbol.includes("BTC") || quote.symbol.includes("ETH") ? ["crypto", "global"] : ["us", "global"],
    providerId: "yahoo-finance-market",
    providerName: "Yahoo Finance Market Snapshot",
    providerTimestamp: new Date().toISOString(),
    providerUrl: "https://finance.yahoo.com/",
    sourceKind: "market_data",
    summary: `${quote.shortName ?? quote.symbol} is ${direction} with ${absChange} move. This is market context only, not a signal.`,
    symbols: [quote.symbol],
    title: `${quote.shortName ?? quote.symbol} market snapshot`,
    url: `https://finance.yahoo.com/quote/${encodeURIComponent(quote.symbol)}`,
  };
}

export const yahooFinanceMarketProvider: EditorialProviderAdapter = {
  fetchStories: async () => {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(MARKET_SYMBOLS.join(","))}`,
      {
        headers: { "user-agent": "IXAI Editorial Provider/1.0" },
        signal: AbortSignal.timeout(4_000),
      },
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance Market Snapshot ${response.status}`);
    }

    const payload = (await response.json()) as YahooQuotePayload;
    const quotes = payload.quoteResponse?.result ?? [];
    const stories = quotes
      .map(storyFromQuote)
      .filter((story): story is EditorialRawStory => Boolean(story));

    if (stories.length === 0) {
      throw new Error("Yahoo Finance Market Snapshot returned no quotes.");
    }

    return stories;
  },
  provider: {
    capabilities: ["daily_brief", "weekly_brief", "market_news", "macro_events", "crypto_news"],
    coverage: ["us", "crypto", "macro_risk", "technology", "ai"],
    id: "yahoo-finance-market",
    name: "Yahoo Finance Market Snapshot",
    priority: 30,
    status: "unknown",
    url: "https://finance.yahoo.com/",
  },
};
