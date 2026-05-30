import { mockNewsItems } from "@/src/lib/news/mock-news";
import type {
  NewsCategory,
  NewsIntakeProvider,
  NewsIntakeResult,
  NewsParserType,
  NewsProviderClassification,
  NewsSourceId,
  NewsSourceStatus,
  NormalizedNewsItem,
} from "@/src/types/news";

const NEWS_CACHE_TTL_MS = 3 * 60 * 1000;
const RSS_FETCH_TIMEOUT_MS = 5000;
const NEWS_INTAKE_DISCLAIMER =
  "Headlines and links may come from public RSS/API sources. IXAI summaries and interpretation are generated or editorially reviewed for informational purposes only and do not constitute investment advice.";

type RssSourceConfig = {
  id: NewsSourceId;
  label: string;
  url: string;
  enabled: boolean;
  categories: NewsCategory[];
  parserType: NewsParserType;
  maxItems: number;
  tags: string[];
  notes: string;
  classification: NewsProviderClassification;
  disabledReason?: string;
  includeKeywords?: string[];
};

let cachedResult: NewsIntakeResult | null = null;

const rssSources: RssSourceConfig[] = [
  {
    id: "coindesk",
    label: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss",
    enabled: true,
    categories: ["crypto", "risk"],
    parserType: "rss",
    maxItems: 5,
    tags: ["crypto", "digital-assets"],
    notes: "Public RSS feed used for crypto market headlines only.",
    classification: "production_active",
  },
  {
    id: "federal-reserve",
    label: "Federal Reserve",
    url: "https://www.federalreserve.gov/feeds/press_monetary.xml",
    enabled: true,
    categories: ["rates", "macro"],
    parserType: "rss",
    maxItems: 3,
    tags: ["rates", "macro", "fomc", "official-source"],
    notes: "Official Federal Reserve monetary policy RSS feed.",
    classification: "production_active",
  },
  {
    id: "marketwatch",
    label: "MarketWatch",
    url: "https://feeds.content.dowjones.io/public/rss/mw_topstories",
    enabled: true,
    categories: ["equities", "macro", "ai_tech", "rates"],
    parserType: "rss",
    maxItems: 6,
    tags: ["us-market", "equities"],
    notes: "Public top-stories RSS feed. IXAI only uses headlines, links, timestamps, and short feed descriptions.",
    classification: "production_active",
    includeKeywords: [
      "ai",
      "anthropic",
      "chip",
      "earnings",
      "fed",
      "fomc",
      "futures",
      "inflation",
      "ipo",
      "market",
      "nasdaq",
      "nvidia",
      "rates",
      "s&p",
      "spacex",
      "stocks",
      "tesla",
      "treasury",
      "yield",
    ],
  },
  {
    id: "yahoo-tw-stock",
    label: "Yahoo 台股",
    url: "https://tw.stock.yahoo.com/rss?category=tw-market",
    enabled: true,
    categories: ["taiwan", "semiconductors", "ai_tech"],
    parserType: "rss",
    maxItems: 8,
    tags: ["taiwan", "tw-stock", "semiconductors", "ai-supply-chain"],
    notes:
      "Public Yahoo Taiwan stock RSS. IXAI only uses headlines, links, timestamps, and feed descriptions.",
    classification: "production_active",
    includeKeywords: [
      "台積電",
      "tsmc",
      "2330",
      "ai",
      "ai 伺服器",
      "ai server",
      "廣達",
      "緯創",
      "緯穎",
      "技嘉",
      "奇鋐",
      "雙鴻",
      "散熱",
      "台達電",
      "聯發科",
      "cowos",
      "先進封裝",
      "hbm",
      "半導體",
      "晶圓代工",
      "外資",
      "台指期",
      "台股",
      "加權指數",
      "etf",
      "伺服器",
      "供應鏈",
    ],
  },
  {
    id: "yahoo-finance",
    label: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    enabled: false,
    categories: ["equities"],
    parserType: "rss",
    maxItems: 4,
    tags: ["markets", "equities"],
    notes: "Provider slot retained for future Yahoo-style market feed integration.",
    classification: "recoverable",
    disabledReason: "Disabled after repeated 429/rate-limit responses during intake checks.",
  },
  {
    id: "cnbc",
    label: "CNBC",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    enabled: true,
    categories: ["macro", "equities", "rates"],
    parserType: "rss",
    maxItems: 5,
    tags: ["us-market", "macro", "equities"],
    notes: "Recovered public CNBC top news RSS in v1.41.3 after endpoint returned stable RSS with usable items.",
    classification: "production_active",
    includeKeywords: [
      "amazon",
      "amzn",
      "apple",
      "avgo",
      "bitcoin",
      "broadcom",
      "cpi",
      "dollar",
      "earnings",
      "fed",
      "fomc",
      "google",
      "googl",
      "inflation",
      "jobs",
      "labor",
      "market",
      "meta",
      "microsoft",
      "msft",
      "nasdaq",
      "nvidia",
      "rates",
      "stocks",
      "tesla",
      "treasury",
      "yield",
    ],
  },
  {
    id: "cnbc-tech",
    label: "CNBC Technology",
    url: "https://www.cnbc.com/id/19854910/device/rss/rss.html",
    enabled: true,
    categories: ["ai_tech", "equities"],
    parserType: "rss",
    maxItems: 5,
    tags: ["us-market", "ai-tech", "technology", "software"],
    notes: "Recovered public CNBC technology RSS for US equity / AI / software coverage.",
    classification: "production_active",
    includeKeywords: [
      "ai",
      "amazon",
      "amzn",
      "anthropic",
      "apple",
      "avgo",
      "broadcom",
      "chip",
      "cloud",
      "cybersecurity",
      "data center",
      "google",
      "googl",
      "hyperscaler",
      "meta",
      "microsoft",
      "msft",
      "nvidia",
      "openai",
      "oracle",
      "orcl",
      "palantir",
      "pltr",
      "semiconductor",
      "software",
      "tesla",
      "tsla",
    ],
  },
  {
    id: "bloomberg",
    label: "Bloomberg",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    enabled: false,
    categories: ["macro", "equities", "rates"],
    parserType: "rss",
    maxItems: 4,
    tags: ["macro", "institutional"],
    notes: "Source seed only. Enable only after confirming stable public RSS terms and access.",
    classification: "recoverable",
    disabledReason: "Provider seed retained; not enabled to avoid relying on unverified RSS access.",
  },
  {
    id: "reuters",
    label: "Reuters",
    url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    enabled: false,
    categories: ["macro", "equities", "geopolitics"],
    parserType: "rss",
    maxItems: 4,
    tags: ["macro", "global"],
    notes: "Source seed only. IXAI should use legal RSS/API access without copying full articles.",
    classification: "recoverable",
    disabledReason: "Endpoint currently returns 404 in verification; keep disabled until Reuters provides stable legal RSS/API access.",
  },
  {
    id: "seeking-alpha",
    label: "Seeking Alpha",
    url: "https://seekingalpha.com/market_currents.xml",
    enabled: true,
    categories: ["equities", "ai_tech"],
    parserType: "rss",
    maxItems: 5,
    tags: ["us-market", "earnings", "equities"],
    notes: "Recovered public market-current RSS in v1.41.3 for US equity headlines. IXAI uses only headline, link, timestamp and short feed description.",
    classification: "production_active",
    includeKeywords: [
      "amazon",
      "amzn",
      "amd",
      "avgo",
      "broadcom",
      "earnings",
      "fed",
      "googl",
      "market",
      "meta",
      "microsoft",
      "mongodb",
      "mdb",
      "nasdaq",
      "nvidia",
      "nvda",
      "palantir",
      "pltr",
      "semiconductor",
      "software",
      "stocks",
      "tesla",
      "tsla",
    ],
  },
  {
    id: "cnyes",
    label: "CNYES",
    url: "https://news.cnyes.com/rss/v1/news/category/tw_stock_news",
    enabled: false,
    categories: ["taiwan", "semiconductors"],
    parserType: "rss",
    maxItems: 4,
    tags: ["taiwan", "semiconductors"],
    notes: "Taiwan market provider slot for a future legal and stable RSS/API source.",
    classification: "recoverable",
    disabledReason: "Endpoint is reachable but returned an empty RSS channel during local verification.",
  },
  {
    id: "commercial-times",
    label: "工商時報",
    url: "https://ctee.com.tw/feed",
    enabled: false,
    categories: ["taiwan", "semiconductors"],
    parserType: "rss",
    maxItems: 4,
    tags: ["taiwan", "semiconductors"],
    notes: "Taiwan business news source seed. Do not fetch full article text.",
    classification: "recoverable",
    disabledReason: "Endpoint currently returns 403 in verification; keep disabled until stable public RSS access is confirmed.",
  },
  {
    id: "economic-daily",
    label: "經濟日報",
    url: "https://money.udn.com/rssfeed/news/1001/5591/5592?ch=money",
    enabled: false,
    categories: ["taiwan", "macro", "semiconductors"],
    parserType: "rss",
    maxItems: 4,
    tags: ["taiwan", "macro"],
    notes: "Taiwan market source seed. Enable only after endpoint verification.",
    classification: "recoverable",
    disabledReason: "Endpoint is reachable but returned an empty RSS channel during local verification.",
  },
  {
    id: "moneydj",
    label: "MoneyDJ",
    url: "https://www.moneydj.com/KMDJ/RSSCenter/RssData.aspx?svc=NW",
    enabled: false,
    categories: ["taiwan", "semiconductors"],
    parserType: "rss",
    maxItems: 4,
    tags: ["taiwan", "supply-chain"],
    notes: "Taiwan market source seed. Enable only after endpoint verification.",
    classification: "experimental",
    disabledReason: "Verification returned HTML with zero RSS items; keep disabled until a stable RSS/API endpoint is confirmed.",
  },
  {
    id: "nasdaq",
    label: "Nasdaq",
    url: "https://www.nasdaq.com/feed/rssoutbound?category=Markets",
    enabled: true,
    categories: ["equities", "ai_tech"],
    parserType: "rss",
    maxItems: 6,
    tags: ["us-market", "equities", "nasdaq"],
    notes: "Recovered public Nasdaq markets RSS in v1.41.3 for US equity and AI / Tech context.",
    classification: "production_active",
    includeKeywords: [
      "ai",
      "amazon",
      "amzn",
      "amd",
      "avgo",
      "broadcom",
      "cloud",
      "earnings",
      "fed",
      "googl",
      "market",
      "meta",
      "microsoft",
      "msft",
      "nasdaq",
      "nvidia",
      "nvda",
      "palantir",
      "pltr",
      "semiconductor",
      "stocks",
      "tesla",
      "treasury",
      "yield",
    ],
  },
  {
    id: "the-block",
    label: "The Block",
    url: "https://www.theblock.co/rss.xml",
    enabled: true,
    categories: ["crypto", "risk"],
    parserType: "rss",
    maxItems: 5,
    tags: ["crypto", "digital-assets"],
    notes: "Recovered public crypto RSS in v1.41.3 for BTC / ETH / institutional digital asset coverage.",
    classification: "production_active",
    includeKeywords: [
      "bitcoin",
      "btc",
      "crypto",
      "custody",
      "ethereum",
      "eth",
      "etf",
      "institutional",
      "liquidity",
      "regulation",
      "stablecoin",
      "tokenized",
    ],
  },
  {
    id: "decrypt",
    label: "Decrypt",
    url: "https://decrypt.co/feed",
    enabled: true,
    categories: ["crypto", "risk"],
    parserType: "rss",
    maxItems: 5,
    tags: ["crypto", "digital-assets"],
    notes: "Recovered public crypto RSS in v1.41.3 for BTC / ETH / regulation / adoption headlines.",
    classification: "production_active",
    includeKeywords: [
      "bitcoin",
      "btc",
      "crypto",
      "custody",
      "ethereum",
      "eth",
      "etf",
      "institutional",
      "regulation",
      "stablecoin",
      "token",
    ],
  },
];

export const mockNewsIntakeProvider: NewsIntakeProvider = {
  id: "ixai-mock",
  label: "IXAI Mock Intake",
  async fetchItems() {
    return mockNewsItems;
  },
};

export const rssProviderPlaceholders = [
  "Reuters",
  "Bloomberg",
  "Yahoo Finance",
  "CNYES",
  "工商時報",
  "經濟日報",
  "MoneyDJ",
  "Futu",
];

function decodeXml(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

function stripTags(value: string) {
  return decodeXml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function idFromSource(source: RssSourceConfig, title: string, url: string) {
  const seed = `${source.id}:${url || title}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return `${source.id}-${hash.toString(16)}`;
}

function containsTerm(text: string, term: string) {
  const lowerTerm = term.toLowerCase();

  if (lowerTerm.length <= 3 && /^[a-z0-9]+$/.test(lowerTerm)) {
    return new RegExp(`\\b${lowerTerm}\\b`, "i").test(text);
  }

  return text.includes(lowerTerm);
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => containsTerm(text, term));
}

function inferCategory(source: RssSourceConfig, headline: string): NewsCategory {
  const text = headline.toLowerCase();

  if (source.id === "federal-reserve") {
    return "rates";
  }

  if (containsAny(text, ["bitcoin", "btc", "crypto", "ether", "ethereum", "stablecoin", "tokenized", "solana", "xrp", "custody"])) {
    return "crypto";
  }

  if (
    containsAny(text, [
      "台積電",
      "tsmc",
      "2330",
      "semiconductor",
      "chip",
      "台積",
      "半導體",
      "晶圓代工",
      "cowos",
      "先進封裝",
      "hbm",
      "廣達",
      "緯創",
      "緯穎",
      "技嘉",
      "奇鋐",
      "雙鴻",
      "散熱",
      "台達電",
      "聯發科",
      "ai 伺服器",
      "ai server",
      "伺服器",
    ])
  ) {
    return "semiconductors";
  }

  if (
    containsAny(text, [
      "taiwan",
      "台灣",
      "台股",
      "twse",
      "taipei",
      "外資",
      "台指期",
      "加權指數",
      "etf",
    ])
  ) {
    return "taiwan";
  }

  if (containsAny(text, ["fed", "fomc", "yield", "treasury", "rate", "rates"])) {
    return "rates";
  }

  if (
    containsAny(text, [
      "ai",
      "amazon",
      "amzn",
      "anthropic",
      "avgo",
      "broadcom",
      "cloud",
      "cybersecurity",
      "data center",
      "googl",
      "google",
      "hyperscaler",
      "meta",
      "microsoft",
      "mongodb",
      "msft",
      "nvidia",
      "nvda",
      "openai",
      "oracle",
      "palantir",
      "pltr",
      "software",
      "tesla",
      "tsla",
    ])
  ) {
    return "ai_tech";
  }

  if (containsAny(text, ["inflation", "cpi", "gdp", "tariff", "economy", "labor", "jobs", "employment", "dollar", "liquidity"])) {
    return "macro";
  }

  if (containsAny(text, ["vix", "volatility", "selloff"])) {
    return "risk";
  }

  if (containsAny(text, ["stock", "stocks", "market", "nasdaq", "s&p", "dow", "ipo"])) {
    return "equities";
  }

  return source.categories[0];
}

function isRelevantToSource(source: RssSourceConfig, title: string, summary: string) {
  if (!source.includeKeywords?.length) {
    return true;
  }

  const text = `${title} ${summary}`.toLowerCase();

  return source.includeKeywords.some((keyword) => containsTerm(text, keyword));
}

function parseRssItems(xml: string, source: RssSourceConfig): NormalizedNewsItem[] {
  const fetchedAt = new Date().toISOString();
  const matches = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];

  return matches.map((match) => {
    const itemXml = match[1];
    const title = stripTags(readTag(itemXml, "title"));
    const url = stripTags(readTag(itemXml, "link"));
    const description = stripTags(readTag(itemXml, "description"));
    const publishedAtRaw = stripTags(readTag(itemXml, "pubDate"));
    const parsedPublishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
    const summary = description.length > 220 ? `${description.slice(0, 217)}...` : description;

    return {
      id: idFromSource(source, title, url),
      title,
      summary: summary || undefined,
      category: inferCategory(source, `${title} ${summary}`),
      source: source.id,
      sourceLabel: source.label,
      url: url || undefined,
      publishedAt: Number.isNaN(parsedPublishedAt.getTime())
        ? fetchedAt
        : parsedPublishedAt.toISOString(),
      fetchedAt,
      tags: source.tags,
    };
  }).filter((item) => item.title && isRelevantToSource(source, item.title, item.summary ?? ""))
    .slice(0, source.maxItems);
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RSS_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "user-agent": "IXAI-NewsIntake/1.0",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeHeadline(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalizeHeadline(value).split(/\s+/).filter((token) => token.length > 1));
}

function headlineSimilarity(left: string, right: string) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);

  if (!leftTokens.size || !rightTokens.size) {
    return 0;
  }

  let overlap = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

function priorityScore(item: NormalizedNewsItem) {
  const text = `${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`.toLowerCase();
  let score = 0;

  if (item.category === "rates" || item.category === "macro") score += 25;
  if (item.category === "ai_tech" || item.category === "semiconductors") score += 22;
  if (item.category === "crypto") score += 16;
  if (item.category === "risk") score += 18;
  if (item.category === "taiwan") score += 14;
  if (containsAny(text, ["fed", "fomc", "treasury", "yield", "rates", "inflation"])) score += 18;
  if (
    containsAny(text, [
      "nvidia",
      "nvda",
      "microsoft",
      "msft",
      "avgo",
      "broadcom",
      "amd",
      "pltr",
      "palantir",
      "mdb",
      "mongodb",
      "tsla",
      "tesla",
      "meta",
      "amzn",
      "amazon",
      "googl",
      "google",
      "cloud",
      "data center",
      "semiconductor",
      "software",
      "cybersecurity",
    ])
  ) score += 22;
  if (containsAny(text, ["bitcoin", "btc", "ethereum", "eth", "stablecoin", "etf flow", "custody", "institutional adoption"])) score += 16;
  if (containsAny(text, ["fcn", "knock-in", "knock out", "worst-of", "ki", "ko"])) score += 10;

  return score;
}

function dedupeItems(items: NormalizedNewsItem[]) {
  const seen = new Set<string>();
  const selected: NormalizedNewsItem[] = [];

  for (const item of [...items].sort((a, b) => priorityScore(b) - priorityScore(a))) {
    const normalizedTitle = normalizeHeadline(item.title);
    const urlKey = item.url ? item.url.replace(/[#?].*$/, "").toLowerCase() : "";
    const exactKey = `${urlKey}:${normalizedTitle}`;

    if (
      seen.has(exactKey) ||
      selected.some((candidate) => headlineSimilarity(candidate.title, item.title) >= 0.82)
    ) {
      continue;
    }

    seen.add(exactKey);
    selected.push(item);
  }

  return selected;
}

function asSourceStatus(
  source: RssSourceConfig,
  status: NewsSourceStatus["status"],
  itemCount: number,
  reason?: string,
): NewsSourceStatus {
  const checkedAt = new Date().toISOString();

  return {
    id: source.id,
    label: source.label,
    enabled: source.enabled,
    classification: source.classification,
    status,
    itemCount,
    reason,
    errorReason: status === "failed" || status === "disabled" ? reason : undefined,
    lastCheckedAt: checkedAt,
    lastSuccessAt: status === "success" ? checkedAt : undefined,
  };
}

export function getFallbackNewsIntakeResult(previousSources: NewsSourceStatus[] = []): NewsIntakeResult {
  const fetchedAt = new Date().toISOString();
  const items = mockNewsItems.map((item) => ({
    ...item,
    fetchedAt,
  }));

  const sourceStatus: NewsSourceStatus[] = [
    ...previousSources,
    {
      id: "ixai-mock",
      label: "IXAI Mock Intake",
      enabled: true,
      status: "fallback",
      itemCount: items.length,
      reason: "All real intake sources were unavailable or returned no usable items.",
      errorReason: "All real intake sources were unavailable or returned no usable items.",
      lastCheckedAt: fetchedAt,
    },
  ];

  return {
    items,
    mode: "fallback",
    itemCount: items.length,
    rawItemCount: items.length,
    duplicatesRemoved: 0,
    fetchedAt,
    sources: sourceStatus,
    sourceStatus,
    disclaimer: NEWS_INTAKE_DISCLAIMER,
  };
}

export async function getLatestNewsIntakeResult(): Promise<NewsIntakeResult> {
  const now = Date.now();

  if (cachedResult && now - new Date(cachedResult.fetchedAt).getTime() < NEWS_CACHE_TTL_MS) {
    return cachedResult;
  }

  const sourceResults: NewsSourceStatus[] = [];
  const realItems: NormalizedNewsItem[] = [];

  for (const source of rssSources) {
    if (!source.enabled) {
      sourceResults.push(asSourceStatus(source, "disabled", 0, source.disabledReason));
      continue;
    }

    try {
      const response = await fetchWithTimeout(source.url);

      if (!response.ok) {
        throw new Error(`${source.label} returned ${response.status}`);
      }

      const xml = await response.text();
      const items = parseRssItems(xml, source);
      realItems.push(...items);
      sourceResults.push(asSourceStatus(
        source,
        items.length > 0 ? "success" : "empty",
        items.length,
        items.length > 0
          ? undefined
          : "Reachable feed returned zero usable items after parser and relevance filters.",
      ));
    } catch (error) {
      sourceResults.push(asSourceStatus(
        source,
        "failed",
        0,
        error instanceof Error ? error.message : "Unknown intake error",
      ));
    }
  }

  const rawItemCount = realItems.length;
  const deduped = dedupeItems(realItems).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (deduped.length === 0) {
    cachedResult = getFallbackNewsIntakeResult(sourceResults);
    return cachedResult;
  }

  cachedResult = {
    items: deduped,
    mode: "real",
    itemCount: deduped.length,
    rawItemCount,
    duplicatesRemoved: Math.max(0, rawItemCount - deduped.length),
    fetchedAt: new Date().toISOString(),
    sources: sourceResults,
    sourceStatus: sourceResults,
    disclaimer: NEWS_INTAKE_DISCLAIMER,
  };

  return cachedResult;
}

export async function getLatestNewsIntake(): Promise<NormalizedNewsItem[]> {
  const result = await getLatestNewsIntakeResult();

  return result.items;
}
