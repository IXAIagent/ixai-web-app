import { mockNewsItems } from "@/src/lib/news/mock-news";
import type {
  NewsCategory,
  NewsIntakeProvider,
  NewsIntakeResult,
  NewsSourceId,
  NormalizedNewsItem,
} from "@/src/types/news";

const NEWS_CACHE_TTL_MS = 12 * 60 * 1000;
const RSS_FETCH_TIMEOUT_MS = 5000;
const NEWS_INTAKE_DISCLAIMER =
  "Headlines and links may come from public RSS/API sources. IXAI summaries and interpretation are generated or editorially reviewed for informational purposes only and do not constitute investment advice.";

type RssSourceConfig = {
  id: NewsSourceId;
  label: string;
  url: string;
  enabled: boolean;
  category: NewsCategory;
  maxItems: number;
  tags: string[];
};

let cachedResult: NewsIntakeResult | null = null;

const rssSources: RssSourceConfig[] = [
  {
    id: "coindesk",
    label: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss",
    enabled: true,
    category: "Crypto",
    maxItems: 6,
    tags: ["crypto", "digital-assets"],
  },
  {
    id: "yahoo-finance",
    label: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    enabled: false,
    category: "Equities",
    maxItems: 4,
    tags: ["markets", "equities"],
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
  "CNBC",
  "Reuters",
  "Bloomberg",
  "CNYES",
  "Futu",
  "The Block",
];

function decodeXml(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
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

function inferCategory(source: RssSourceConfig, title: string): NewsCategory {
  const text = title.toLowerCase();

  if (text.includes("bitcoin") || text.includes("btc") || text.includes("crypto") || text.includes("ether")) {
    return "Crypto";
  }

  if (text.includes("fed") || text.includes("yield") || text.includes("rate")) {
    return "Rates";
  }

  if (text.includes("ai") || text.includes("nvidia") || text.includes("semiconductor")) {
    return "AI / Tech";
  }

  return source.category;
}

function parseRssItems(xml: string, source: RssSourceConfig): NormalizedNewsItem[] {
  const fetchedAt = new Date().toISOString();
  const matches = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];

  return matches.slice(0, source.maxItems).map((match) => {
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
      category: inferCategory(source, title),
      source: source.id,
      sourceLabel: source.label,
      url: url || undefined,
      publishedAt: Number.isNaN(parsedPublishedAt.getTime())
        ? fetchedAt
        : parsedPublishedAt.toISOString(),
      fetchedAt,
      tags: source.tags,
    };
  }).filter((item) => item.title);
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

function dedupeItems(items: NormalizedNewsItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.url ?? ""}:${item.title.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function getFallbackNewsIntakeResult(): NewsIntakeResult {
  const fetchedAt = new Date().toISOString();
  const items = mockNewsItems.map((item) => ({
    ...item,
    fetchedAt,
  }));

  return {
    items,
    mode: "fallback",
    itemCount: items.length,
    fetchedAt,
    sources: [
      {
        id: "ixai-mock",
        label: "IXAI Mock Intake",
        status: "fallback",
        itemCount: items.length,
      },
    ],
    disclaimer: NEWS_INTAKE_DISCLAIMER,
  };
}

export async function getLatestNewsIntakeResult(): Promise<NewsIntakeResult> {
  const now = Date.now();

  if (cachedResult && now - new Date(cachedResult.fetchedAt).getTime() < NEWS_CACHE_TTL_MS) {
    return cachedResult;
  }

  const sourceResults: NewsIntakeResult["sources"] = [];
  const realItems: NormalizedNewsItem[] = [];

  for (const source of rssSources) {
    if (!source.enabled) {
      sourceResults.push({
        id: source.id,
        label: source.label,
        status: "disabled",
        itemCount: 0,
      });
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
      sourceResults.push({
        id: source.id,
        label: source.label,
        status: "success",
        itemCount: items.length,
      });
    } catch {
      sourceResults.push({
        id: source.id,
        label: source.label,
        status: "failed",
        itemCount: 0,
      });
    }
  }

  const deduped = dedupeItems(realItems).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (deduped.length === 0) {
    cachedResult = getFallbackNewsIntakeResult();
    return cachedResult;
  }

  cachedResult = {
    items: deduped,
    mode: "real",
    itemCount: deduped.length,
    fetchedAt: new Date().toISOString(),
    sources: sourceResults,
    disclaimer: NEWS_INTAKE_DISCLAIMER,
  };

  return cachedResult;
}

export async function getLatestNewsIntake(): Promise<NormalizedNewsItem[]> {
  const result = await getLatestNewsIntakeResult();

  return result.items;
}
