export type PublicIntelligenceModuleId =
  | "market_pulse"
  | "macro_watch"
  | "ai_tech_watch"
  | "crypto_watch"
  | "fcn_awareness"
  | "risk_regime";

export type PublicIntelligenceModule = {
  id: PublicIntelligenceModuleId;
  title: string;
  eyebrow: string;
  summary: string;
  signals: string[];
  watchExamples: string[];
};

export const PUBLIC_INTELLIGENCE_MODULES: PublicIntelligenceModule[] = [
  {
    eyebrow: "Market Pulse",
    id: "market_pulse",
    signals: [
      "US equity tone",
      "Nasdaq / S&P 500 sentiment",
      "Taiwan AI supply chain context",
      "Risk-on / risk-off awareness",
    ],
    summary:
      "以公開市場脈絡整理美股、台股 AI 供應鏈與 crypto risk tone，幫助讀者先理解市場正在關注什麼。",
    title: "Market Pulse",
    watchExamples: ["US Equity", "Nasdaq", "S&P 500", "Taiwan AI"],
  },
  {
    eyebrow: "Macro Watch",
    id: "macro_watch",
    signals: [
      "Fed / rates",
      "CPI / inflation",
      "US Treasury yield",
      "USD liquidity",
    ],
    summary:
      "追蹤利率、通膨、美元流動性與總經事件如何影響風險偏好；只做 general market interpretation。",
    title: "Macro Watch",
    watchExamples: ["Fed", "CPI", "US10Y", "DXY"],
  },
  {
    eyebrow: "AI / Tech Watch",
    id: "ai_tech_watch",
    signals: [
      "AI infrastructure",
      "Semiconductors",
      "Cloud / software",
      "Data center demand",
    ],
    summary:
      "整理 AI infrastructure、半導體、雲端與資料中心主題，建立 public watch context，不做個股買賣判斷。",
    title: "AI / Tech Watch",
    watchExamples: ["NVDA", "MSFT", "AMD", "AVGO", "PLTR", "MDB", "ORCL"],
  },
  {
    eyebrow: "Crypto Watch",
    id: "crypto_watch",
    signals: [
      "BTC / ETH tone",
      "Volatility awareness",
      "Funding / leverage context",
      "Grid range awareness",
    ],
    summary:
      "以風險意識角度觀察 BTC、ETH 與主要 crypto liquidity，不揭露個人部位，也不提供交易指令。",
    title: "Crypto Watch",
    watchExamples: ["BTC", "ETH", "BNB", "Volatility"],
  },
  {
    eyebrow: "FCN Awareness",
    id: "fcn_awareness",
    signals: [
      "KO / KI concepts",
      "Strike awareness",
      "Worst performer",
      "Observation dates",
    ],
    summary:
      "用教育型方式說明 FCN 結構與觀察重點，協助投資人先理解產品機制，再與合格專業人士討論。",
    title: "FCN Awareness",
    watchExamples: ["KO", "KI", "Strike", "Worst Performer"],
  },
  {
    eyebrow: "Risk Regime",
    id: "risk_regime",
    signals: [
      "Calm",
      "Neutral",
      "Elevated",
      "Stress",
    ],
    summary:
      "以 public market context 描述風險狀態，協助讀者理解市場情緒層級，不代表個人投資建議。",
    title: "Risk Regime",
    watchExamples: ["Calm", "Neutral", "Elevated", "Stress"],
  },
];

export const PUBLIC_INTELLIGENCE_ENGINE_NOTE =
  "Public Intelligence Engine provides general market awareness, education, and risk context. It does not provide personalized portfolio analysis, personal FCN risk conclusions, buy/sell recommendations, target prices, or return promises.";
