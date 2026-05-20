export type ProEngineId =
  | "portfolio"
  | "fcn"
  | "ai_risk"
  | "crypto"
  | "morning_brief"
  | "watch_radar";

export type ProEngineSurface = {
  id: ProEngineId;
  title: string;
  label: string;
  status: "locked" | "preview";
  state: string;
  signal: string;
  summary: string;
  metric: {
    label: string;
    value: string;
    tone: "calm" | "watch" | "stress";
  };
  lockedItems: string[];
};

export const proEngineSurfaces: ProEngineSurface[] = [
  {
    id: "portfolio",
    title: "Portfolio Risk State",
    label: "Portfolio Intelligence",
    status: "preview",
    state: "Mixed exposure",
    signal: "AI beta and duration sensitivity are the largest simulated drivers.",
    summary:
      "連結 portfolio 後，IXAI Pro 會把持倉轉換成可監控的風險狀態，而不是只顯示資產列表。",
    metric: {
      label: "Risk concentration",
      value: "Medium",
      tone: "watch",
    },
    lockedItems: ["Position mapping", "Sector beta", "Drawdown path"],
  },
  {
    id: "fcn",
    title: "FCN Exposure",
    label: "Structured Product Engine",
    status: "preview",
    state: "Barrier watch",
    signal: "Simulated FCN basket is sensitive to semiconductor and Nasdaq volatility.",
    summary:
      "未來 FCN engine 會追蹤標的價格、障礙距離、配息節奏與提前出場風險。",
    metric: {
      label: "Barrier distance",
      value: "Locked",
      tone: "stress",
    },
    lockedItems: ["Barrier monitor", "Coupon calendar", "Worst-of asset"],
  },
  {
    id: "ai_risk",
    title: "AI Market Stress",
    label: "AI Risk Alerts",
    status: "preview",
    state: "Watch",
    signal: "AI leadership remains intact, but breadth is narrower than headline index strength.",
    summary:
      "Pro alerts 會把 AI 主線、利率、估值與市場廣度轉成可操作的風險提醒。",
    metric: {
      label: "Stress pulse",
      value: "42 / 100",
      tone: "watch",
    },
    lockedItems: ["Alert rules", "Breadth shift", "Rate shock"],
  },
  {
    id: "crypto",
    title: "Crypto Risk Monitor",
    label: "Digital Asset Engine",
    status: "preview",
    state: "Risk-on beta",
    signal: "BTC and ETH remain liquidity-sensitive; dollar and yields are the control variables.",
    summary:
      "Crypto Monitoring 會把價格、流動性與總經壓力合併成 daily risk context。",
    metric: {
      label: "Liquidity beta",
      value: "High",
      tone: "stress",
    },
    lockedItems: ["BTC / ETH regime", "Liquidity read", "Volatility band"],
  },
  {
    id: "morning_brief",
    title: "AI Morning Brief",
    label: "Morning Brief Engine",
    status: "locked",
    state: "Personal brief pending",
    signal: "Your watchlist, preferences, and market regime will shape the morning memo.",
    summary:
      "Free 版提供市場簡報；Pro 版會生成與你 watchlist 和風險曝險相關的個人 morning brief。",
    metric: {
      label: "Personalization",
      value: "Locked",
      tone: "calm",
    },
    lockedItems: ["Your watchlist", "Your risks", "Your next focus"],
  },
  {
    id: "watch_radar",
    title: "Personalized Watch Radar",
    label: "Personal Risk State",
    status: "locked",
    state: "Radar not connected",
    signal: "IXAI will rank what matters most across your watchlist before the market opens.",
    summary:
      "Personal Risk State 會把自選、偏好、價格變動與市場敘事合併成個人監控雷達。",
    metric: {
      label: "Monitored symbols",
      value: "Pro",
      tone: "calm",
    },
    lockedItems: ["Priority queue", "Risk notes", "Next actions"],
  },
];
