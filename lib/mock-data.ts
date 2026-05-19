export type Direction = "up" | "down" | "flat";

export type MarketAsset = {
  symbol: string;
  name: string;
  price: string;
  dailyChange: string;
  direction: Direction;
};

export type WatchlistAsset = {
  symbol: string;
  name: string;
  thesis: string;
  status: string;
  direction: Direction;
};

export const marketOverview: MarketAsset[] = [
  {
    symbol: "SPY",
    name: "S&P 500 ETF",
    price: "$621.40",
    dailyChange: "+0.42%",
    direction: "up",
  },
  {
    symbol: "QQQ",
    name: "Nasdaq 100 ETF",
    price: "$537.18",
    dailyChange: "+0.61%",
    direction: "up",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$138.22",
    dailyChange: "+1.18%",
    direction: "up",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$104,860",
    dailyChange: "-0.28%",
    direction: "down",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,820",
    dailyChange: "+0.09%",
    direction: "flat",
  },
  {
    symbol: "TSMC",
    name: "台積電 ADR",
    price: "$186.72",
    dailyChange: "+0.74%",
    direction: "up",
  },
];

export const watchlist: WatchlistAsset[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    thesis: "服務業務毛利率與裝置換機週期。",
    status: "等待催化",
    direction: "flat",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    thesis: "自動駕駛敘事與交車波動之間的拉扯。",
    status: "分歧偏高",
    direction: "down",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    thesis: "AI 算力需求與資料中心能見度。",
    status: "核心觀察",
    direction: "up",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    thesis: "機構資金流與總經流動性。",
    status: "流動性觀察",
    direction: "flat",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    thesis: "協議經濟與 L2 活動變化。",
    status: "相對價值",
    direction: "up",
  },
];

export const proFeatures = [
  "FCN 監控",
  "AI 風險提醒",
  "投資組合情報",
  "Crypto 監控",
];
