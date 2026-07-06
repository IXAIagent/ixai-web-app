import type { EditorialStory } from "@/src/lib/editorial/editorial-types";

export type EditorialThemeId =
  | "ai"
  | "semiconductor"
  | "fed_rates"
  | "us_tech"
  | "taiwan_market"
  | "crypto"
  | "energy"
  | "china"
  | "macro_risk"
  | "fcn_structured_products";

export type EditorialTheme = {
  id: EditorialThemeId;
  label: string;
  confidence: number;
  matchedStoryIds: string[];
  signals: string[];
};

type ThemeRule = {
  id: EditorialThemeId;
  label: string;
  keywords: string[];
  markets?: string[];
  symbols?: string[];
};

export const EDITORIAL_THEME_RULES: ThemeRule[] = [
  {
    id: "ai",
    keywords: ["ai", "artificial intelligence", "nvidia", "semiconductor", "supply chain"],
    label: "AI",
    symbols: ["NVDA", "MSFT", "TSLA", "2330", "TSM"],
  },
  {
    id: "semiconductor",
    keywords: ["semiconductor", "chip", "foundry", "taiwan ai", "supply chain"],
    label: "Semiconductor",
    symbols: ["NVDA", "TSM", "2330"],
  },
  {
    id: "fed_rates",
    keywords: ["fed", "rate", "rates", "inflation", "dxy", "tlt"],
    label: "Fed / Rates",
    symbols: ["TLT", "DXY"],
  },
  {
    id: "us_tech",
    keywords: ["us tech", "large-cap", "nasdaq", "ai leaders", "equity"],
    label: "US Tech",
    markets: ["us"],
    symbols: ["NVDA", "MSFT", "TSLA"],
  },
  {
    id: "taiwan_market",
    keywords: ["taiwan", "taiwan ai", "台股", "2330"],
    label: "Taiwan Market",
    markets: ["tw"],
    symbols: ["2330", "TSM"],
  },
  {
    id: "crypto",
    keywords: ["crypto", "bitcoin", "ether", "btc", "eth"],
    label: "Crypto",
    markets: ["crypto"],
    symbols: ["BTC", "ETH"],
  },
  {
    id: "energy",
    keywords: ["energy", "oil", "gas", "opec", "crude"],
    label: "Energy",
  },
  {
    id: "china",
    keywords: ["china", "hong kong", "hk", "0700", "geopolitics"],
    label: "China",
    markets: ["hk"],
    symbols: ["0700.HK"],
  },
  {
    id: "macro_risk",
    keywords: ["macro", "risk", "volatility", "vix", "uncertainty"],
    label: "Macro Risk",
    markets: ["global"],
    symbols: ["VIX"],
  },
  {
    id: "fcn_structured_products",
    keywords: ["fcn", "structured", "worst-of", "observation", "coupon"],
    label: "FCN / Structured Products",
  },
];

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function storyText(story: EditorialStory) {
  return [
    story.title,
    story.summary,
    ...story.categories,
    ...story.symbols,
    ...story.markets,
  ]
    .join(" ")
    .toLowerCase();
}

function scoreThemeMatch(story: EditorialStory, rule: ThemeRule) {
  const text = storyText(story);
  const keywordHits = rule.keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
  const marketHits = (rule.markets ?? []).filter((market) => story.markets.includes(market as never)).length;
  const symbolHits = (rule.symbols ?? []).filter((symbol) =>
    story.symbols.some((candidate) => candidate.toUpperCase() === symbol.toUpperCase()),
  ).length;

  return clamp(keywordHits * 0.22 + marketHits * 0.24 + symbolHits * 0.3);
}

export function detectEditorialThemes(stories: EditorialStory[]): EditorialTheme[] {
  return EDITORIAL_THEME_RULES.map((rule) => {
    const matchedStories = stories
      .map((story) => ({
        score: scoreThemeMatch(story, rule),
        story,
      }))
      .filter((match) => match.score > 0);
    const matchedStoryIds = matchedStories.map((match) => match.story.id);
    const confidence = clamp(
      matchedStories.reduce(
        (sum, match) => sum + match.score * (match.story.rankingScore ?? match.story.importance),
        0,
      ) / Math.max(1, matchedStories.length),
    );

    return {
      confidence,
      id: rule.id,
      label: rule.label,
      matchedStoryIds,
      signals: matchedStories
        .slice(0, 3)
        .map((match) => `${match.story.title} (${Math.round(match.score * 100)}%)`),
    };
  }).filter((theme) => theme.matchedStoryIds.length > 0);
}

export function getRequiredEditorialThemeIds(): EditorialThemeId[] {
  return EDITORIAL_THEME_RULES.map((rule) => rule.id);
}
