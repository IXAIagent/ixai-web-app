import {
  aiSupplyChainSymbols,
  getFallbackMarketQuotes,
  marketSentimentSymbols,
} from "@/src/lib/market-data/fallback";
import { getMarketQuotes } from "@/src/lib/market-data/providers";
import type { MarketQuote } from "@/src/lib/market-data/types";
import { getLatestNewsIntakeResult } from "@/src/lib/news/providers";
import type { NewsCategory, NewsIntakeMode, NormalizedNewsItem } from "@/src/types/news";

export type SentimentCard = {
  symbol: string;
  name: string;
  price: string;
  dailyChange: string;
  sourceLabel: string;
  status: MarketQuote["status"];
  updatedAt: string;
  state: string;
  commentary: string;
};

export type MarketSummaryItem = {
  label: string;
  state: "calm" | "neutral" | "watch" | "risk";
  text: string;
};

export type TopMarketSignal = {
  id: string;
  title: string;
  sourceLabel: string;
  impactTag: string;
  riskTag: string;
  interpretation: string;
  publishedAt: string;
};

export type MarketIntelligenceResponse = {
  generatedAt: string;
  sentimentCards: SentimentCard[];
  fearGreed: {
    state: string;
    commentary: string;
  };
  summary: MarketSummaryItem[];
  aiSupplyChain: MarketQuote[];
  topSignals: TopMarketSignal[];
  newsMode: NewsIntakeMode;
  inputNewsCount: number;
};

const intelligenceSymbols = [
  ...marketSentimentSymbols,
  "BTC",
  "NVDA",
  "TSM",
  "2330.TW",
  ...aiSupplyChainSymbols,
];

function quoteBySymbol(quotes: MarketQuote[], symbol: string) {
  return quotes.find((quote) => quote.symbol === symbol);
}

function parseNumber(value?: string) {
  if (!value || value === "--" || value.includes("不可用")) {
    return undefined;
  }

  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));

  return Number.isFinite(parsed) ? parsed : undefined;
}

function vixState(value?: number) {
  if (typeof value !== "number") {
    return "資料待更新";
  }

  if (value < 15) {
    return "Calm";
  }

  if (value <= 25) {
    return "Neutral";
  }

  return "Risk-off";
}

function dxyState(value?: number) {
  if (typeof value !== "number") {
    return "資料待更新";
  }

  if (value >= 105) {
    return "美元偏強";
  }

  if (value <= 102) {
    return "美元偏弱";
  }

  return "區間震盪";
}

function supplyBadge(quote: MarketQuote) {
  if (quote.status === "unavailable") {
    return "待更新";
  }

  if (quote.direction === "up") {
    return "資金偏強";
  }

  if (quote.direction === "down") {
    return "短線承壓";
  }

  return "中性觀察";
}

function buildSentimentCards(quotes: MarketQuote[]): SentimentCard[] {
  const vix = quoteBySymbol(quotes, "^VIX");
  const tnx = quoteBySymbol(quotes, "^TNX");
  const dxy = quoteBySymbol(quotes, "DX-Y.NYB");
  const vixValue = parseNumber(vix?.price);
  const dxyValue = parseNumber(dxy?.price);

  return [
    {
      symbol: "^VIX",
      name: "VIX 波動率指數",
      price: vix?.price ?? "資料不可用",
      dailyChange: vix?.dailyChange ?? "--",
      sourceLabel: vix?.sourceLabel ?? "備援資料",
      status: vix?.status ?? "unavailable",
      updatedAt: vix?.updatedAt ?? new Date().toISOString(),
      state: vixState(vixValue),
      commentary:
        typeof vixValue === "number" && vixValue > 25
          ? "波動率升高，市場短線偏向 risk-off，需留意股債與 Crypto 同步降槓桿。"
          : "波動率未見極端壓力，風險情緒仍需搭配美元與利率觀察。",
    },
    {
      symbol: "^TNX",
      name: "US 10Y Yield",
      price: tnx?.price ?? "資料不可用",
      dailyChange: tnx?.dailyChange ?? "--",
      sourceLabel: tnx?.sourceLabel ?? "備援資料",
      status: tnx?.status ?? "unavailable",
      updatedAt: tnx?.updatedAt ?? new Date().toISOString(),
      state: tnx?.direction === "up" ? "殖利率走高" : tnx?.direction === "down" ? "殖利率回落" : "利率中性",
      commentary:
        tnx?.direction === "up"
          ? "美債殖利率走高時，科技股與長天期資產估值壓力通常上升。"
          : "殖利率未明顯上行時，市場可重新評估成長股與風險資產的估值壓力。",
    },
    {
      symbol: "DX-Y.NYB",
      name: "DXY 美元指數",
      price: dxy?.price ?? "資料不可用",
      dailyChange: dxy?.dailyChange ?? "--",
      sourceLabel: dxy?.sourceLabel ?? "備援資料",
      status: dxy?.status ?? "unavailable",
      updatedAt: dxy?.updatedAt ?? new Date().toISOString(),
      state: dxyState(dxyValue),
      commentary:
        typeof dxyValue === "number" && dxyValue >= 105
          ? "美元偏強通常降低非美資產與 Crypto 的風險偏好。"
          : "美元未明顯轉強時，風險資產壓力較不集中於匯率面。",
    },
  ];
}

function buildSummary(quotes: MarketQuote[]): MarketSummaryItem[] {
  const vix = quoteBySymbol(quotes, "^VIX");
  const dxy = quoteBySymbol(quotes, "DX-Y.NYB");
  const tnx = quoteBySymbol(quotes, "^TNX");
  const btc = quoteBySymbol(quotes, "BTC");
  const nvda = quoteBySymbol(quotes, "NVDA");
  const tsm = quoteBySymbol(quotes, "TSM") ?? quoteBySymbol(quotes, "2330.TW");
  const vixValue = parseNumber(vix?.price);
  const dxyValue = parseNumber(dxy?.price);

  const riskState =
    (typeof vixValue === "number" && vixValue > 25) ||
    (typeof dxyValue === "number" && dxyValue >= 105)
      ? "risk"
      : "neutral";

  return [
    {
      label: "Risk sentiment",
      state: riskState,
      text:
        riskState === "risk"
          ? "VIX 或美元偏強顯示市場風險偏好降溫，短線應重視避險與流動性變化。"
          : "波動率與美元尚未同時釋出極端壓力，整體風險情緒維持中性觀察。",
    },
    {
      label: "Tech pressure",
      state: tnx?.direction === "up" || nvda?.direction === "down" ? "watch" : "neutral",
      text:
        tnx?.direction === "up"
          ? "美債殖利率走高，科技股估值壓力增加；需觀察 NVDA 與大型成長股是否延續相對強勢。"
          : "利率壓力暫未擴大，AI 科技股仍以資金動能與財報預期作為主要觀察軸。",
    },
    {
      label: "Crypto risk appetite",
      state: btc?.direction === "down" ? "watch" : btc?.direction === "up" ? "calm" : "neutral",
      text:
        btc?.direction === "up"
          ? "BTC 維持正向動能，Crypto 風險偏好仍有支撐。"
          : btc?.direction === "down"
            ? "BTC 轉弱時需留意槓桿與美元流動性對 Crypto 的連動壓力。"
            : "BTC 變化有限，幣圈風險情緒暫時偏中性。",
    },
    {
      label: "Taiwan AI supply chain tone",
      state: tsm?.direction === "down" ? "watch" : "neutral",
      text:
        tsm?.direction === "up"
          ? "台積電與 AI server 供應鏈維持資金聚焦，台股 AI 主線仍具市場能見度。"
          : "台灣 AI 供應鏈需要觀察台積電、伺服器與散熱族群是否同步轉強。",
    },
  ];
}

function impactTagForCategory(category: NewsCategory) {
  const labels: Record<NewsCategory, string> = {
    macro: "MACRO",
    rates: "FED",
    equities: "EQUITY",
    ai_tech: "AI",
    crypto: "CRYPTO",
    taiwan: "TAIWAN",
    semiconductors: "SEMIS",
    risk: "RISK",
    geopolitics: "GEO",
  };

  return labels[category];
}

function riskTagForCategory(category: NewsCategory) {
  if (category === "rates" || category === "macro") {
    return "利率風險";
  }

  if (category === "ai_tech" || category === "semiconductors" || category === "taiwan") {
    return "AI 供應鏈";
  }

  if (category === "crypto") {
    return "風險偏好";
  }

  if (category === "risk" || category === "geopolitics") {
    return "避險觀察";
  }

  return "市場動能";
}

function interpretationForNews(item: NormalizedNewsItem) {
  switch (item.category) {
    case "rates":
      return "殖利率與 Fed 訊號會直接影響科技股估值與美元流動性。";
    case "macro":
      return "總經數據若偏強，市場可能重新定價利率路徑與風險資產折現率。";
    case "ai_tech":
      return "AI 科技股仍是資金焦點，但高估值環境下需同步觀察利率與財報預期。";
    case "semiconductors":
    case "taiwan":
      return "半導體與台灣供應鏈是 AI capex 的核心觀察軸，留意資金是否擴散。";
    case "crypto":
      return "Crypto 新聞主要反映流動性與風險偏好，需避免用單一事件推論趨勢。";
    case "risk":
    case "geopolitics":
      return "事件風險可能提高避險需求，短線需觀察美元、VIX 與股債連動。";
    default:
      return "市場訊號需與價格、利率與風險偏好交叉確認。";
  }
}

function buildTopSignals(items: NormalizedNewsItem[]) {
  return items.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    sourceLabel: item.sourceLabel,
    impactTag: impactTagForCategory(item.category),
    riskTag: riskTagForCategory(item.category),
    interpretation: interpretationForNews(item),
    publishedAt: item.publishedAt,
  }));
}

export async function getMarketIntelligence(): Promise<MarketIntelligenceResponse> {
  const [quotesResult, newsResult] = await Promise.allSettled([
    getMarketQuotes(intelligenceSymbols),
    getLatestNewsIntakeResult(),
  ]);
  const quotes =
    quotesResult.status === "fulfilled"
      ? quotesResult.value
      : getFallbackMarketQuotes(intelligenceSymbols);
  const news =
    newsResult.status === "fulfilled"
      ? newsResult.value
      : {
          items: [],
          mode: "fallback" as const,
          itemCount: 0,
        };

  return {
    generatedAt: new Date().toISOString(),
    sentimentCards: buildSentimentCards(quotes),
    fearGreed: {
      state: "Data integration pending",
      commentary: "CNN Fear & Greed 後續可透過合法 API 接入；目前先保留為情緒儀表 placeholder。",
    },
    summary: buildSummary(quotes),
    aiSupplyChain: aiSupplyChainSymbols.map(
      (symbol) => quoteBySymbol(quotes, symbol) ?? getFallbackMarketQuotes([symbol])[0],
    ),
    topSignals: buildTopSignals(news.items),
    newsMode: news.mode,
    inputNewsCount: news.itemCount,
  };
}

export { supplyBadge };
