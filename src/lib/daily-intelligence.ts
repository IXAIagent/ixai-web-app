import type { MarketDirection } from "@/src/lib/market-data/types";

export type PulseSentiment = "risk-on" | "risk-off" | "neutral";

export type MarketPulseItem = {
  symbol: string;
  label: string;
  session: "Asia Session" | "US Futures" | "Macro";
  direction: MarketDirection;
  feeling: PulseSentiment;
  note: string;
  updatedLabel: string;
};

export type IntelligenceFeedItem = {
  category: string;
  title: string;
  summary: string;
  updatedLabel: string;
};

export const marketPulseItems: MarketPulseItem[] = [
  {
    symbol: "BTC",
    label: "Bitcoin",
    session: "Asia Session",
    direction: "up",
    feeling: "risk-on",
    note: "流動性預期仍支撐高 beta 資產，但波動容錯下降。",
    updatedLabel: "Updated 4 mins ago",
  },
  {
    symbol: "ETH",
    label: "Ethereum",
    session: "Asia Session",
    direction: "up",
    feeling: "risk-on",
    note: "相對 BTC 維持修復，仍需觀察風險偏好延續性。",
    updatedLabel: "Updated 6 mins ago",
  },
  {
    symbol: "SPY",
    label: "S&P 500 ETF",
    session: "US Futures",
    direction: "flat",
    feeling: "neutral",
    note: "指數定價偏穩，市場等待利率與大型科技財報訊號。",
    updatedLabel: "Updated 9 mins ago",
  },
  {
    symbol: "QQQ",
    label: "Nasdaq 100 ETF",
    session: "US Futures",
    direction: "up",
    feeling: "risk-on",
    note: "AI 主線仍是領漲核心，但集中度提高使回撤更敏感。",
    updatedLabel: "Updated 10 mins ago",
  },
  {
    symbol: "VIX",
    label: "Volatility Index",
    session: "Macro",
    direction: "down",
    feeling: "risk-on",
    note: "避險需求降溫，短線風險偏好改善但仍非全面擴散。",
    updatedLabel: "Updated 12 mins ago",
  },
  {
    symbol: "DXY",
    label: "US Dollar Index",
    session: "Macro",
    direction: "flat",
    feeling: "neutral",
    note: "美元維持區間，市場仍以利率路徑作為風險資產錨點。",
    updatedLabel: "Updated 15 mins ago",
  },
];

export const intelligenceFeedItems: IntelligenceFeedItem[] = [
  {
    category: "Rates",
    title: "美債殖利率仍是今日市場估值核心。",
    summary: "長端利率若維持高檔，AI 與高 beta 資產的估值擴張空間會受限。",
    updatedLabel: "Updated 8 mins ago",
  },
  {
    category: "AI Equity",
    title: "AI 科技股領漲結構延續，但市場廣度仍偏窄。",
    summary: "NVIDIA 與雲端 capex 仍是主線，需警惕預期過度集中。",
    updatedLabel: "Updated 14 mins ago",
  },
  {
    category: "Crypto",
    title: "BTC / ETH 對流動性訊號保持敏感。",
    summary: "Crypto 仍更像風險偏好的放大器，而不是獨立於總經的行情。",
    updatedLabel: "Updated 18 mins ago",
  },
  {
    category: "Taiwan",
    title: "台積電仍是台股資金溫度計。",
    summary: "半導體權值股若量能轉弱，台股指數韌性可能同步下降。",
    updatedLabel: "Updated 22 mins ago",
  },
];

export const todayRiskFocus = {
  label: "IXAI Risk Focus",
  title: "今日最大風險不是方向錯判，而是忽略利率對風險資產的再定價速度。",
  summary:
    "當市場同時擁抱 AI 成長、Crypto beta 與降息預期時，任何利率路徑修正都可能讓相關資產同步回撤。IXAI 先看風險，再看機會。",
  updatedLabel: "Updated 11 mins ago",
};
