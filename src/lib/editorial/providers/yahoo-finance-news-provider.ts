import type { EditorialProviderAdapter, EditorialRawStory } from "@/src/lib/editorial/providers/provider-types";

type YahooStreamItem = {
  content?: {
    clickThroughUrl?: { url?: string };
    pubDate?: string;
    summary?: string;
    title?: string;
  };
  id?: string;
};

type YahooNewsPayload = {
  data?: {
    main?: {
      stream?: YahooStreamItem[];
    };
  };
};

function storyFromYahoo(item: YahooStreamItem, index: number): EditorialRawStory | null {
  const content = item.content;
  const title = content?.title?.trim();

  if (!title) {
    return null;
  }

  return {
    categories: ["us", "technology", "market_news"],
    confidence: 0.58,
    id: `yahoo-finance-news-${item.id ?? index}`,
    importance: 0.6,
    markets: ["us", "global"],
    providerId: "yahoo-finance-news",
    providerName: "Yahoo Finance News",
    providerTimestamp: new Date().toISOString(),
    providerUrl: "https://finance.yahoo.com/news/",
    publishedAt: content?.pubDate ? new Date(content.pubDate).toISOString() : undefined,
    sourceKind: "news",
    summary:
      content?.summary?.trim() ||
      "Yahoo Finance headline. Summary is limited until an approved article extraction adapter is enabled.",
    symbols: [],
    title,
    url: content?.clickThroughUrl?.url,
  };
}

export const yahooFinanceNewsProvider: EditorialProviderAdapter = {
  fetchStories: async () => {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v1/finance/trending/US?count=20",
      {
        headers: { "user-agent": "IXAI Editorial Provider/1.0" },
        signal: AbortSignal.timeout(4_000),
      },
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance News ${response.status}`);
    }

    const payload = (await response.json()) as YahooNewsPayload;
    const stream = payload.data?.main?.stream ?? [];
    const stories = stream
      .map(storyFromYahoo)
      .filter((story): story is EditorialRawStory => Boolean(story));

    if (stories.length === 0) {
      throw new Error("Yahoo Finance News returned no stories.");
    }

    return stories.slice(0, 10);
  },
  provider: {
    capabilities: ["daily_brief", "weekly_brief", "market_news", "company_news"],
    coverage: ["us", "technology", "ai", "macro"],
    id: "yahoo-finance-news",
    name: "Yahoo Finance News",
    priority: 20,
    status: "unknown",
    url: "https://finance.yahoo.com/news/",
  },
};
