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
  meaning: string;
  whyItMatters: string;
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
    meaning:
      "Market Pulse 是公開市場溫度計，用來整理主要資產與風險偏好的方向。",
    title: "Market Pulse",
    watchExamples: ["US Equity", "Nasdaq", "S&P 500", "Taiwan AI"],
    whyItMatters:
      "它幫助讀者先建立市場背景，再決定是否進一步設定個人 Watchlist 與 intelligence preference。",
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
    meaning:
      "Macro Watch 將 Fed、利率、美元與通膨整理為總經觀察框架。",
    title: "Macro Watch",
    watchExamples: ["Fed", "CPI", "US10Y", "DXY"],
    whyItMatters:
      "總經變化會影響風險資產評價與波動，但此模組只提供教育型脈絡，不做交易結論。",
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
    meaning:
      "AI / Tech Watch 聚焦 AI 基礎建設、半導體、雲端、資料中心與台灣 AI 供應鏈。",
    title: "AI / Tech Watch",
    watchExamples: ["NVDA", "MSFT", "AMD", "AVGO", "PLTR", "MDB", "ORCL"],
    whyItMatters:
      "AI 題材常牽動跨市場資金與供應鏈情緒，IXAI 在公開層只整理觀察主題，不提供目標價或買賣建議。",
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
    meaning:
      "Crypto Watch 將 BTC、ETH、流動性與槓桿情緒放在 general risk context 中觀察。",
    title: "Crypto Watch",
    watchExamples: ["BTC", "ETH", "BNB", "Volatility"],
    whyItMatters:
      "Crypto 波動可能反映風險偏好變化；公開模組不呈現個人部位，也不提供 grid 或交易操作建議。",
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
    meaning:
      "FCN Awareness 只解釋 KO、KI、Strike、Worst Performer 與 observation date 等結構概念。",
    title: "FCN Awareness",
    watchExamples: ["KO", "KI", "Strike", "Worst Performer"],
    whyItMatters:
      "FCN structures should be understood together with licensed professionals and official product documentation.",
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
      "以 public market context 描述 Low、Moderate、Elevated、High 風險狀態，協助讀者理解市場情緒層級。",
    meaning:
      "Risk Regime 是教育型風險狀態語言：Low 代表市場較穩定，Moderate 代表一般波動，Elevated 代表風險升溫，High 代表壓力較高。",
    title: "Risk Regime",
    watchExamples: ["Low", "Moderate", "Elevated", "High"],
    whyItMatters:
      "它幫助讀者描述市場環境，但不是預測工具，也不是個人投資建議。",
  },
];

export const PUBLIC_INTELLIGENCE_ENGINE_NOTE =
  "Public Intelligence Engine provides general market awareness, education, and risk context. It does not provide personalized portfolio analysis, personal FCN risk conclusions, buy/sell recommendations, target prices, or return promises.";
