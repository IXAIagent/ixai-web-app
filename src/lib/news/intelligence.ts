import type { NormalizedNewsItem } from "@/src/types/news";

export type NewsIntelligenceCategory =
  | "FED"
  | "RATES"
  | "AI"
  | "SEMICONDUCTOR"
  | "CRYPTO"
  | "TAIWAN"
  | "CHINA"
  | "GEOPOLITICS"
  | "ENERGY"
  | "ETF_FLOW"
  | "EARNINGS"
  | "MACRO";

export type NewsImpactLevel = "LOW" | "MEDIUM" | "HIGH";

export type MarketImpact =
  | "US_TECH"
  | "CRYPTO"
  | "TAIWAN_AI"
  | "FCN_RISK"
  | "RISK_ON"
  | "RISK_OFF";

export type NewsIntelligenceItem = {
  id: string;
  title: string;
  sourceLabel: string;
  publishedAt: string;
  category: NewsIntelligenceCategory;
  impactLevel: NewsImpactLevel;
  marketImpact: MarketImpact;
  impactTag: string;
  riskTag: string;
  shortInterpretation: string;
  whyItMatters: string;
};

const categoryKeywords: Array<{
  category: NewsIntelligenceCategory;
  terms: string[];
}> = [
  { category: "FED", terms: ["fed", "fomc", "powell", "federal reserve", "聯準會"] },
  { category: "RATES", terms: ["yield", "treasury", "bond", "rates", "殖利率", "公債"] },
  { category: "AI", terms: ["ai", "nvidia", "openai", "anthropic", "gpu", "server", "nvda"] },
  { category: "SEMICONDUCTOR", terms: ["semiconductor", "chip", "tsmc", "台積", "晶片", "半導體"] },
  { category: "CRYPTO", terms: ["bitcoin", "btc", "ethereum", "ether", "crypto", "stablecoin", "solana"] },
  { category: "TAIWAN", terms: ["taiwan", "台灣", "台股", "twse", "taipei"] },
  { category: "CHINA", terms: ["china", "chinese", "beijing", "中國", "大陸"] },
  { category: "GEOPOLITICS", terms: ["war", "tariff", "sanction", "hormuz", "israel", "iran", "geopolitical"] },
  { category: "ENERGY", terms: ["oil", "crude", "opec", "energy", "natural gas", "brent"] },
  { category: "ETF_FLOW", terms: ["etf", "fund flow", "inflows", "outflows", "flows"] },
  { category: "EARNINGS", terms: ["earnings", "revenue", "profit", "guidance", "財報", "營收"] },
  { category: "MACRO", terms: ["inflation", "cpi", "pce", "gdp", "jobs", "payroll", "economy", "總經"] },
];

function containsTerm(text: string, term: string) {
  const normalizedTerm = term.toLowerCase();

  if (/^[a-z0-9]+$/.test(normalizedTerm) && normalizedTerm.length <= 4) {
    return new RegExp(`\\b${normalizedTerm}\\b`, "i").test(text);
  }

  return text.includes(normalizedTerm);
}

function classifyNews(item: NormalizedNewsItem): NewsIntelligenceCategory {
  const text = `${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`.toLowerCase();
  const match = categoryKeywords.find(({ terms }) => terms.some((term) => containsTerm(text, term)));

  if (match) {
    return match.category;
  }

  if (item.category === "rates") {
    return "RATES";
  }

  if (item.category === "ai_tech") {
    return "AI";
  }

  if (item.category === "semiconductors") {
    return "SEMICONDUCTOR";
  }

  if (item.category === "crypto") {
    return "CRYPTO";
  }

  if (item.category === "taiwan") {
    return "TAIWAN";
  }

  if (item.category === "geopolitics") {
    return "GEOPOLITICS";
  }

  return "MACRO";
}

function impactForCategory(category: NewsIntelligenceCategory): MarketImpact {
  if (category === "CRYPTO") {
    return "CRYPTO";
  }

  if (category === "TAIWAN" || category === "SEMICONDUCTOR") {
    return "TAIWAN_AI";
  }

  if (category === "AI" || category === "EARNINGS") {
    return "US_TECH";
  }

  if (category === "FED" || category === "RATES" || category === "ENERGY" || category === "GEOPOLITICS") {
    return "RISK_OFF";
  }

  if (category === "ETF_FLOW") {
    return "RISK_ON";
  }

  return "FCN_RISK";
}

function levelForNews(item: NormalizedNewsItem, category: NewsIntelligenceCategory): NewsImpactLevel {
  const text = `${item.title} ${item.summary ?? ""}`.toLowerCase();
  const highTerms = ["shock", "surge", "plunge", "selloff", "crash", "war", "hormuz", "fed", "tariff", "cuts", "hikes"];

  if (highTerms.some((term) => containsTerm(text, term))) {
    return "HIGH";
  }

  if (category === "FED" || category === "RATES" || category === "GEOPOLITICS" || category === "SEMICONDUCTOR") {
    return "MEDIUM";
  }

  return "LOW";
}

function riskTag(category: NewsIntelligenceCategory, marketImpact: MarketImpact) {
  if (category === "FED" || category === "RATES") {
    return "利率風險";
  }

  if (category === "AI" || category === "SEMICONDUCTOR" || category === "TAIWAN") {
    return "AI 供應鏈";
  }

  if (category === "CRYPTO") {
    return "槓桿情緒";
  }

  if (category === "GEOPOLITICS" || category === "ENERGY" || marketImpact === "RISK_OFF") {
    return "避險壓力";
  }

  if (category === "ETF_FLOW") {
    return "資金流向";
  }

  return "市場再定價";
}

function shortInterpretation(category: NewsIntelligenceCategory) {
  const interpretations: Record<NewsIntelligenceCategory, string> = {
    FED: "Fed 訊號會牽動利率路徑，科技股估值與美元流動性需同步觀察。",
    RATES: "殖利率維持高檔時，成長股與長天期資產估值壓力延續。",
    AI: "AI server、GPU 與大型科技股仍是資金聚焦區，需留意估值與財報預期是否同步支撐。",
    SEMICONDUCTOR: "半導體供應鏈仍是 AI capex 的核心受益軸，資金是否擴散是下一個觀察點。",
    CRYPTO: "Crypto 訊號主要反映流動性與槓桿風險，BTC 仍是風險偏好的主導指標。",
    TAIWAN: "台股 AI 供應鏈與半導體權值股仍是區域資金風險偏好的關鍵溫度計。",
    CHINA: "中國相關訊號可能影響亞洲風險資產、供應鏈與美元避險需求。",
    GEOPOLITICS: "地緣事件會提高避險需求，需觀察能源、美元與 VIX 是否同步反應。",
    ENERGY: "能源價格波動會回到通膨與利率預期，進而影響股債定價。",
    ETF_FLOW: "ETF 資金流可作為風險偏好與市場廣度的輔助觀察。",
    EARNINGS: "財報與 guidance 是科技股估值能否被基本面支撐的短線驗證。",
    MACRO: "總經訊號會影響利率、美元與風險資產折現率，需與市場價格交叉確認。",
  };

  return interpretations[category];
}

function whyItMatters(category: NewsIntelligenceCategory, impact: MarketImpact) {
  if (impact === "TAIWAN_AI") {
    return "這會影響台積電、伺服器、散熱與電源供應鏈的資金輪動，也會連動台股風險情緒。";
  }

  if (impact === "US_TECH") {
    return "大型科技股權重高，任何估值或財報預期變化都會影響 QQQ、NVDA 與 AI 主線。";
  }

  if (impact === "CRYPTO") {
    return "Crypto 對美元流動性與風險偏好敏感，波動擴大時容易外溢到高 beta 資產。";
  }

  if (impact === "RISK_OFF") {
    return "risk-off 訊號通常伴隨美元、VIX 或利率壓力，會降低市場承接高波動資產的意願。";
  }

  if (category === "ETF_FLOW") {
    return "資金流向能補充價格訊號，協助判斷上漲是否有廣度與持續性。";
  }

  return "此訊號會改變市場對成長、利率與風險資產的相對定價。";
}

export function enrichNewsItem(item: NormalizedNewsItem): NewsIntelligenceItem {
  const category = classifyNews(item);
  const marketImpact = impactForCategory(category);
  const impactLevel = levelForNews(item, category);

  return {
    id: item.id,
    title: item.title,
    sourceLabel: item.sourceLabel,
    publishedAt: item.publishedAt,
    category,
    impactLevel,
    marketImpact,
    impactTag: category,
    riskTag: riskTag(category, marketImpact),
    shortInterpretation: shortInterpretation(category),
    whyItMatters: whyItMatters(category, marketImpact),
  };
}

export function buildNewsIntelligence(items: NormalizedNewsItem[]) {
  const enriched = items.map(enrichNewsItem).sort((a, b) => {
    const levelScore: Record<NewsImpactLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const scoreDiff = levelScore[b.impactLevel] - levelScore[a.impactLevel];

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return {
    topIntelligence: enriched.slice(0, 5),
    taiwanAiFocus: enriched
      .filter((item) => item.marketImpact === "TAIWAN_AI" || item.category === "TAIWAN")
      .slice(0, 4),
    cryptoIntelligence: enriched
      .filter((item) => item.marketImpact === "CRYPTO" || item.category === "CRYPTO")
      .slice(0, 4),
  };
}
