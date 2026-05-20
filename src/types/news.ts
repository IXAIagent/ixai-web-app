export type NewsCategory =
  | "Macro"
  | "AI / Tech"
  | "Crypto"
  | "Rates"
  | "Equities"
  | "Risk"
  | "Geopolitics";

export type NewsSourceId =
  | "yahoo-finance"
  | "cnbc"
  | "reuters"
  | "bloomberg"
  | "coindesk"
  | "cnyes"
  | "futu"
  | "the-block"
  | "ixai-mock";

export type NormalizedNewsItem = {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: NewsSourceId;
  sourceLabel: string;
  url?: string;
  publishedAt: string;
  fetchedAt: string;
};

export type NewsIntakeProvider = {
  id: NewsSourceId;
  label: string;
  fetchItems(): Promise<NormalizedNewsItem[]>;
};
