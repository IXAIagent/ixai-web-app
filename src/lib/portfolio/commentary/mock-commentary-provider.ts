import type {
  PortfolioCommentary,
  PortfolioCommentaryCategory,
  PortfolioCommentaryRiskLevel,
  PortfolioCommentarySentiment,
} from "@/src/lib/portfolio/commentary/commentary-types";
import type { PortfolioCommentaryProvider } from "@/src/lib/portfolio/commentary/commentary-provider";
import type { PortfolioNewsItem } from "@/src/lib/portfolio/news/news-types";

type MockCommentaryRule = {
  category?: PortfolioCommentaryCategory;
  headline: string;
  riskLevel: PortfolioCommentaryRiskLevel;
  sentiment: PortfolioCommentarySentiment;
  summary: string;
};

const MOCK_COMMENTARY_RULES: Record<string, MockCommentaryRule> = {
  AAPL: {
    headline: "AAPL remains a core stock watch item",
    riskLevel: "low",
    sentiment: "neutral",
    summary:
      "AAPL commentary remains monitoring-only, focused on whether portfolio exposure stays balanced with the broader stock allocation.",
  },
  AVGO: {
    headline: "AVGO keeps AI infrastructure exposure visible",
    riskLevel: "medium",
    sentiment: "bullish",
    summary:
      "AVGO is flagged as a constructive infrastructure signal while remaining subject to valuation and concentration monitoring.",
  },
  BTC: {
    category: "crypto",
    headline: "BTC keeps crypto exposure in active watch mode",
    riskLevel: "medium",
    sentiment: "volatile",
    summary:
      "BTC commentary highlights crypto volatility context and its effect on portfolio monitoring, not directional trading calls.",
  },
  ETH: {
    category: "crypto",
    headline: "ETH remains a neutral crypto monitoring input",
    riskLevel: "medium",
    sentiment: "neutral",
    summary:
      "ETH is treated as a portfolio monitoring symbol where volatility and liquidity context matter more than short-term direction.",
  },
  MDB: {
    category: "fcn_underlying",
    headline: "MDB is treated as an FCN risk-watch underlying",
    riskLevel: "high",
    sentiment: "risk_watch",
    summary:
      "MDB commentary emphasizes FCN underlying sensitivity and risk-awareness, especially where basket concentration could matter.",
  },
  MSFT: {
    headline: "MSFT remains a stable AI software watch item",
    riskLevel: "low",
    sentiment: "bullish",
    summary:
      "MSFT commentary tracks AI software and cloud exposure as a portfolio context signal without implying an action.",
  },
  NVDA: {
    headline: "NVDA keeps AI beta visible in portfolio monitoring",
    riskLevel: "medium",
    sentiment: "bullish",
    summary:
      "NVDA commentary highlights AI beta and semiconductor exposure as a monitoring input for concentration and volatility awareness.",
  },
  ORCL: {
    headline: "ORCL remains a neutral infrastructure watch item",
    riskLevel: "medium",
    sentiment: "neutral",
    summary:
      "ORCL commentary stays neutral and focuses on whether cloud infrastructure exposure changes the portfolio intelligence universe.",
  },
  PLTR: {
    headline: "PLTR shows positive momentum in the mock commentary layer",
    riskLevel: "medium",
    sentiment: "bullish",
    summary:
      "PLTR is flagged for monitoring momentum and software exposure while avoiding any trading instruction or return expectation.",
  },
  TSLA: {
    headline: "TSLA is monitored as a volatile stock exposure",
    riskLevel: "high",
    sentiment: "volatile",
    summary:
      "TSLA commentary emphasizes volatility, concentration, and event sensitivity as risk-awareness signals for the dashboard.",
  },
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function mapCategory(newsItem: PortfolioNewsItem): PortfolioCommentaryCategory {
  if (newsItem.category === "crypto") {
    return "crypto";
  }

  if (newsItem.category === "fcn_underlying") {
    return "fcn_underlying";
  }

  return "stock";
}

function buildFallbackRule(symbol: string): MockCommentaryRule {
  return {
    headline: `${symbol} remains in the portfolio monitoring universe`,
    riskLevel: "medium",
    sentiment: "neutral",
    summary:
      "This mock commentary records portfolio relevance only. It does not represent advice, a forecast, or a trade recommendation.",
  };
}

function buildCommentary(newsItem: PortfolioNewsItem): PortfolioCommentary {
  const symbol = normalizeSymbol(newsItem.symbol);
  const rule = MOCK_COMMENTARY_RULES[symbol] ?? buildFallbackRule(symbol);

  return {
    category: rule.category ?? mapCategory(newsItem),
    confidence: rule.sentiment === "neutral" ? 0.68 : 0.74,
    generatedAt: "2026-06-11T00:00:00.000Z",
    headline: rule.headline,
    id: `mock-commentary-${symbol.toLowerCase()}`,
    riskLevel: rule.riskLevel,
    sentiment: rule.sentiment,
    summary: rule.summary,
    symbol,
  };
}

export const mockCommentaryProvider: PortfolioCommentaryProvider = {
  async generateCommentary(newsItems) {
    return newsItems.map(buildCommentary);
  },
};
