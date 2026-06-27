import type {
  YahooMarketState,
  YahooQuote,
  YahooQuoteCacheStatus,
  YahooQuoteSnapshot,
} from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

export type WorkspaceLiveMarketProvider = "yahoo";

export type WorkspaceLiveMarketDataQuality =
  | "live"
  | "partial"
  | "stale"
  | "unavailable";

export type WorkspaceLiveMarketQuote = {
  asOf: string | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  marketState: YahooMarketState;
  price: number | null;
  provider: WorkspaceLiveMarketProvider;
  sourceQuote: YahooQuote;
  sourceStatus: "live" | "stale" | "unavailable";
  symbol: string;
};

export type WorkspaceLiveMarketSnapshot = {
  asOf: string | null;
  availableQuotes: WorkspaceLiveMarketQuote[];
  cacheStatus: YahooQuoteCacheStatus;
  dataQuality: WorkspaceLiveMarketDataQuality;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  marketState: YahooMarketState | "mixed";
  missingSymbols: string[];
  provider: WorkspaceLiveMarketProvider;
  readOnly: true;
  requestedSymbols: string[];
  sourceSnapshot: YahooQuoteSnapshot | null;
  staleSymbols: string[];
};

export type WorkspaceLiveMarketSymbolSource =
  | "crypto"
  | "fcn_underlying"
  | "stock"
  | "watchlist";

export type WorkspaceLiveMarketSymbolRecord = {
  source: WorkspaceLiveMarketSymbolSource;
  symbol: string;
};

export type WorkspaceLiveMarketInput = {
  extraSymbols?: string[];
  truth?: PortfolioTruthReadback | null;
};
