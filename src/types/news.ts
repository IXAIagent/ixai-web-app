export type NewsCategory =
  | "macro"
  | "rates"
  | "equities"
  | "ai_tech"
  | "crypto"
  | "taiwan"
  | "semiconductors"
  | "risk"
  | "geopolitics";

export type NewsSourceId =
  | "yahoo-finance"
  | "yahoo-tw-stock"
  | "cnbc"
  | "reuters"
  | "bloomberg"
  | "coindesk"
  | "federal-reserve"
  | "marketwatch"
  | "nasdaq"
  | "cnyes"
  | "commercial-times"
  | "economic-daily"
  | "moneydj"
  | "seeking-alpha"
  | "decrypt"
  | "futu"
  | "the-block"
  | "ixai-mock";

export type NewsParserType = "rss";

export type NewsSourceStatus = {
  id: NewsSourceId;
  label: string;
  enabled: boolean;
  status: "success" | "failed" | "disabled" | "fallback";
  itemCount: number;
  reason?: string;
  lastSuccessAt?: string;
  lastCheckedAt?: string;
  errorReason?: string;
};

export type NormalizedNewsItem = {
  id: string;
  title: string;
  summary?: string;
  category: NewsCategory;
  source: NewsSourceId;
  sourceLabel: string;
  url?: string;
  publishedAt: string;
  fetchedAt: string;
  tags?: string[];
};

export type NewsIntakeProvider = {
  id: NewsSourceId;
  label: string;
  fetchItems(): Promise<NormalizedNewsItem[]>;
};

export type NewsIntakeMode = "real" | "fallback";

export type NewsIntakeResult = {
  items: NormalizedNewsItem[];
  mode: NewsIntakeMode;
  itemCount: number;
  rawItemCount?: number;
  duplicatesRemoved?: number;
  fetchedAt: string;
  sources: NewsSourceStatus[];
  sourceStatus: NewsSourceStatus[];
  disclaimer: string;
};
