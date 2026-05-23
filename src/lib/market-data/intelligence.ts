import {
  aiSupplyChainSymbols,
  getFallbackMarketQuotes,
  marketSentimentSymbols,
} from "@/src/lib/market-data/fallback";
import { getMarketQuotes } from "@/src/lib/market-data/providers";
import type { MarketQuote } from "@/src/lib/market-data/types";
import {
  buildNewsIntelligence,
  type NewsIntelligenceItem,
} from "@/src/lib/news/intelligence";
import { getLatestNewsIntakeResult } from "@/src/lib/news/providers";
import type { NewsIntakeMode } from "@/src/types/news";

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

export type RiskRadarAlert = {
  id: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  detail: string;
};

export type MarketIntelligenceResponse = {
  generatedAt: string;
  sentimentCards: SentimentCard[];
  fearGreed: {
    state: string;
    commentary: string;
  };
  summary: MarketSummaryItem[];
  riskRadar: RiskRadarAlert[];
  aiSupplyChain: MarketQuote[];
  topIntelligence: NewsIntelligenceItem[];
  taiwanAiFocus: NewsIntelligenceItem[];
  cryptoIntelligence: NewsIntelligenceItem[];
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

function parsePercent(value?: string) {
  return parseNumber(value);
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

function buildRiskRadar(quotes: MarketQuote[]): RiskRadarAlert[] {
  const alerts: RiskRadarAlert[] = [];
  const vix = parseNumber(quoteBySymbol(quotes, "^VIX")?.price);
  const tnx = parseNumber(quoteBySymbol(quotes, "^TNX")?.price);
  const dxy = parseNumber(quoteBySymbol(quotes, "DX-Y.NYB")?.price);
  const btcMove = Math.abs(parsePercent(quoteBySymbol(quotes, "BTC")?.dailyChange) ?? 0);

  if (typeof vix === "number" && vix > 25) {
    alerts.push({
      id: "vix-risk-off",
      level: "HIGH",
      title: "VIX > 25：Risk-off warning",
      detail: "波動率升高，市場可能進入避險模式；需留意股債、Crypto 與高 beta 資產同步降槓桿。",
    });
  }

  if (typeof tnx === "number" && tnx > 4.5) {
    alerts.push({
      id: "tnx-tech-pressure",
      level: "MEDIUM",
      title: "US10Y > 4.5%：Tech valuation pressure",
      detail: "美債殖利率處於高檔時，AI 與大型科技股估值折現率壓力上升。",
    });
  }

  if (typeof dxy === "number" && dxy > 105) {
    alerts.push({
      id: "dxy-dollar-pressure",
      level: "MEDIUM",
      title: "DXY > 105：Strong dollar pressure",
      detail: "美元偏強通常壓抑非美資產與 Crypto 風險偏好，也會影響亞洲資金流。",
    });
  }

  if (btcMove > 5) {
    alerts.push({
      id: "btc-volatility",
      level: "MEDIUM",
      title: "BTC daily move > 5%：Crypto volatility elevated",
      detail: "BTC 單日波動擴大，代表 Crypto 槓桿與流動性狀態需要更密集監控。",
    });
  }

  return alerts.length > 0
    ? alerts
    : [
        {
          id: "market-watch",
          level: "LOW",
          title: "No major risk threshold triggered",
          detail: "VIX、美元、利率與 BTC 波動目前未觸發主要風險門檻；仍需持續觀察新聞與價格是否同步轉向。",
        },
      ];
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
  const newsIntelligence = buildNewsIntelligence(news.items);

  return {
    generatedAt: new Date().toISOString(),
    sentimentCards: buildSentimentCards(quotes),
    fearGreed: {
      state: "Data integration pending",
      commentary: "CNN Fear & Greed 後續可透過合法 API 接入；目前先保留為情緒儀表 placeholder。",
    },
    summary: buildSummary(quotes),
    riskRadar: buildRiskRadar(quotes),
    aiSupplyChain: aiSupplyChainSymbols.map(
      (symbol) => quoteBySymbol(quotes, symbol) ?? getFallbackMarketQuotes([symbol])[0],
    ),
    topIntelligence: newsIntelligence.topIntelligence,
    taiwanAiFocus: newsIntelligence.taiwanAiFocus,
    cryptoIntelligence: newsIntelligence.cryptoIntelligence,
    newsMode: news.mode,
    inputNewsCount: news.itemCount,
  };
}

export { supplyBadge };
