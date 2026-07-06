import type { EditorialProviderAdapter, EditorialRawStory } from "@/src/lib/editorial/providers/provider-types";

const GOOGLE_NEWS_TOPICS = [
  { categories: ["macro"], markets: ["global", "us"] as const, query: "macro markets Fed rates inflation" },
  { categories: ["ai", "technology"], markets: ["us"] as const, query: "AI technology stocks semiconductor" },
  { categories: ["semiconductor", "taiwan_market"], markets: ["tw", "us"] as const, query: "Taiwan semiconductor TSMC AI supply chain" },
  { categories: ["crypto"], markets: ["crypto", "global"] as const, query: "crypto bitcoin ethereum market volatility" },
  { categories: ["macro_risk", "risk_volatility"], markets: ["global"] as const, query: "market volatility risk VIX macro" },
];

function stripXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(value: string) {
  return stripXml(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function tag(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseGoogleNewsRss(xml: string, topic: (typeof GOOGLE_NEWS_TOPICS)[number]): EditorialRawStory[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 5);

  return items.map((match, index) => {
    const item = match[1];
    const title = tag(item, "title") || "Google News market update";
    const url = tag(item, "link");
    const publishedAt = tag(item, "pubDate");

    return {
      categories: topic.categories,
      confidence: 0.62,
      id: `google-news-rss-${topic.categories[0]}-${index}-${Buffer.from(title).toString("base64url").slice(0, 12)}`,
      importance: 0.64,
      markets: [...topic.markets],
      providerId: "google-news-rss",
      providerName: "Google News RSS",
      providerTimestamp: new Date().toISOString(),
      providerUrl: "https://news.google.com/rss",
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      sourceKind: "rss",
      summary: "Google News RSS headline. Summary is limited until a richer article extraction adapter is approved.",
      symbols: [],
      title,
      url,
    };
  });
}

async function fetchTopic(query: string) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(url, {
    headers: { "user-agent": "IXAI Editorial Provider/1.0" },
    signal: AbortSignal.timeout(4_000),
  });

  if (!response.ok) {
    throw new Error(`Google News RSS ${response.status}`);
  }

  return response.text();
}

export const googleNewsRssProvider: EditorialProviderAdapter = {
  fetchStories: async () => {
    const results = await Promise.allSettled(
      GOOGLE_NEWS_TOPICS.map(async (topic) => parseGoogleNewsRss(await fetchTopic(topic.query), topic)),
    );

    return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  },
  provider: {
    capabilities: ["daily_brief", "weekly_brief", "market_news", "macro_events"],
    coverage: ["macro", "us", "taiwan", "crypto", "macro_risk", "ai", "technology"],
    id: "google-news-rss",
    name: "Google News RSS",
    priority: 10,
    status: "unknown",
    url: "https://news.google.com/rss",
  },
};
