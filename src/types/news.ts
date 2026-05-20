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
  fetchedAt: string;
  sources: {
    id: NewsSourceId;
    label: string;
    status: "success" | "failed" | "disabled" | "fallback";
    itemCount: number;
  }[];
  disclaimer: string;
};
