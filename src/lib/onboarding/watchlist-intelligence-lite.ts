import type {
  IntelligenceInterest,
  OnboardingMarket,
  OnboardingProfile,
  OnboardingWatchlistItem,
} from "@/src/lib/onboarding/profile";
import type {
  PublicIntelligenceModule,
  PublicIntelligenceModuleId,
} from "@/src/lib/intelligence/public-engine";
import { PUBLIC_INTELLIGENCE_MODULES } from "@/src/lib/intelligence/public-engine";

export type WatchlistMemorySource = "onboarding" | "watchlist" | "interest" | "market";

export type WatchlistIntelligenceLiteModule = PublicIntelligenceModule & {
  reason: string;
  source: WatchlistMemorySource;
};

export type WatchlistIntelligenceLiteSummary = {
  hasMemory: boolean;
  interests: string[];
  markets: string[];
  modules: WatchlistIntelligenceLiteModule[];
  nextStep: string;
  symbols: string[];
};

const marketLabels: Record<OnboardingMarket, string> = {
  crypto: "Crypto",
  etf: "ETF",
  fcn: "FCN",
  taiwan_equities: "台股",
  us_equities: "美股",
};

const interestLabels: Record<IntelligenceInterest, string> = {
  ai_risk_monitor: "AI Risk Monitor",
  ai_watchlist: "AI Watchlist",
  btc_eth_alert: "BTC / ETH Alert",
  daily_brief: "Daily Brief",
  fcn_intelligence: "FCN Intelligence",
  macro_risk: "Macro Risk",
};

const moduleById = new Map(PUBLIC_INTELLIGENCE_MODULES.map((module) => [module.id, module]));

function addModule(
  modules: Map<PublicIntelligenceModuleId, WatchlistIntelligenceLiteModule>,
  id: PublicIntelligenceModuleId,
  reason: string,
  source: WatchlistMemorySource,
) {
  const publicModule = moduleById.get(id);

  if (!publicModule || modules.has(id)) {
    return;
  }

  modules.set(id, {
    ...publicModule,
    reason,
    source,
  });
}

function inferModulesFromWatchlist(
  modules: Map<PublicIntelligenceModuleId, WatchlistIntelligenceLiteModule>,
  watchlist: OnboardingWatchlistItem[],
) {
  for (const item of watchlist) {
    const symbol = item.symbol.toUpperCase();

    if (item.type === "crypto" || ["BTC", "ETH", "SOL", "BNB"].includes(symbol)) {
      addModule(modules, "crypto_watch", "你的 watchlist seed 包含 crypto 風險資產。", "watchlist");
      addModule(modules, "risk_regime", "Crypto 波動可作為風險偏好觀察入口。", "watchlist");
      continue;
    }

    if (item.type === "etf") {
      addModule(modules, "market_pulse", "ETF seed 適合先連到公開市場脈絡。", "watchlist");
      addModule(modules, "macro_watch", "ETF 常受利率、美元與總經情境影響。", "watchlist");
      continue;
    }

    if (/^\d{4}(\.TW)?$/.test(symbol) || ["TSM", "TSMC", "2330"].includes(symbol)) {
      addModule(modules, "ai_tech_watch", "台股 / 半導體 seed 可連到 AI 供應鏈觀察。", "watchlist");
      addModule(modules, "market_pulse", "台股 seed 會進入公開市場溫度計。", "watchlist");
      continue;
    }

    addModule(modules, "ai_tech_watch", "股票 seed 可先連到 AI / Tech Watch 或公開市場脈絡。", "watchlist");
    addModule(modules, "market_pulse", "股票 seed 適合建立公開市場背景。", "watchlist");
  }
}

export function buildWatchlistIntelligenceLite(
  profile: OnboardingProfile,
): WatchlistIntelligenceLiteSummary {
  const modules = new Map<PublicIntelligenceModuleId, WatchlistIntelligenceLiteModule>();

  for (const market of profile.markets) {
    if (market === "crypto") {
      addModule(modules, "crypto_watch", "你在 onboarding 選擇了幣圈市場。", "market");
      addModule(modules, "risk_regime", "Crypto 可協助觀察市場風險偏好。", "market");
    }

    if (market === "taiwan_equities") {
      addModule(modules, "ai_tech_watch", "你在 onboarding 選擇了台股與 AI 供應鏈。", "market");
      addModule(modules, "market_pulse", "台股 AI 供應鏈屬於公開市場情緒核心。", "market");
    }

    if (market === "us_equities" || market === "etf") {
      addModule(modules, "market_pulse", "你在 onboarding 選擇了美股 / ETF 市場。", "market");
      addModule(modules, "macro_watch", "美股與 ETF 會受到利率、美元與風險偏好影響。", "market");
    }

    if (market === "fcn") {
      addModule(modules, "fcn_awareness", "你在 onboarding 選擇了 FCN 關注。", "market");
      addModule(modules, "risk_regime", "FCN 結構理解需要搭配公開風險環境。", "market");
    }
  }

  for (const interest of profile.interests) {
    if (interest === "ai_watchlist" || interest === "ai_risk_monitor") {
      addModule(modules, "ai_tech_watch", "你的 intelligence interests 包含 AI watchlist / risk monitor。", "interest");
    }

    if (interest === "btc_eth_alert") {
      addModule(modules, "crypto_watch", "你的 intelligence interests 包含 BTC / ETH alert。", "interest");
    }

    if (interest === "macro_risk") {
      addModule(modules, "macro_watch", "你的 intelligence interests 包含 Macro Risk。", "interest");
      addModule(modules, "risk_regime", "Macro Risk 會連到公開風險狀態語言。", "interest");
    }

    if (interest === "fcn_intelligence") {
      addModule(modules, "fcn_awareness", "你的 intelligence interests 包含 FCN Intelligence。", "interest");
    }

    if (interest === "daily_brief") {
      addModule(modules, "market_pulse", "Daily Brief 會先以公開市場脈絡整理每日情報。", "interest");
    }
  }

  inferModulesFromWatchlist(modules, profile.watchlist);

  const hasMemory =
    profile.markets.length > 0 || profile.interests.length > 0 || profile.watchlist.length > 0;

  return {
    hasMemory,
    interests: profile.interests.map((interest) => interestLabels[interest] ?? interest),
    markets: profile.markets.map((market) => marketLabels[market] ?? market),
    modules: [...modules.values()].slice(0, 5),
    nextStep: hasMemory
      ? "Refine onboarding or open Daily / Weekly Intelligence to keep building this memory."
      : "Start onboarding to create your first Intelligence Layer.",
    symbols: profile.watchlist.map((item) => item.symbol).slice(0, 12),
  };
}
