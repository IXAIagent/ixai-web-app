export type OnboardingMarket = "us_equities" | "crypto" | "taiwan_equities" | "fcn" | "etf";

export type InvestmentStyle = "long_term" | "swing" | "income" | "growth" | "conservative";

export type RiskPreference = "conservative" | "balanced" | "aggressive";

export type IntelligenceInterest =
  | "daily_brief"
  | "ai_watchlist"
  | "fcn_intelligence"
  | "macro_risk"
  | "btc_eth_alert"
  | "ai_risk_monitor";

export type WatchlistAssetType = "stock" | "crypto" | "etf";

export type OnboardingOption<T extends string> = {
  copy: string;
  id: T;
  label: string;
};

export type OnboardingWatchlistItem = {
  addedAt: string;
  symbol: string;
  type: WatchlistAssetType;
};

export type OnboardingProfile = {
  completedAt?: string;
  currentStep: number;
  interests: IntelligenceInterest[];
  lineIntent: boolean;
  markets: OnboardingMarket[];
  riskPreference?: RiskPreference;
  startedAt?: string;
  styles: InvestmentStyle[];
  watchlist: OnboardingWatchlistItem[];
};

export const ONBOARDING_PROFILE_STORAGE_KEY = "ixai.onboarding.profile.v1";

export const ONBOARDING_MARKETS: Array<OnboardingOption<OnboardingMarket>> = [
  {
    copy: "美股大型科技、ETF 與風險資產結構。",
    id: "us_equities",
    label: "美股",
  },
  {
    copy: "BTC、ETH 與加密市場風險情緒。",
    id: "crypto",
    label: "幣圈",
  },
  {
    copy: "台股、半導體與 AI 供應鏈。",
    id: "taiwan_equities",
    label: "台股",
  },
  {
    copy: "收益型結構商品與風險觀察。",
    id: "fcn",
    label: "FCN",
  },
  {
    copy: "跨資產配置與長期觀察。",
    id: "etf",
    label: "ETF",
  },
];

export const INVESTMENT_STYLES: Array<OnboardingOption<InvestmentStyle>> = [
  { copy: "重視長週期趨勢與穩定追蹤。", id: "long_term", label: "長線" },
  { copy: "關注區間、波動與事件窗口。", id: "swing", label: "波段" },
  { copy: "重視現金流、收益與波動控制。", id: "income", label: "收益型" },
  { copy: "關注 AI、科技與高成長主題。", id: "growth", label: "成長型" },
  { copy: "以風險承受度與下檔控制優先。", id: "conservative", label: "保守型" },
];

export const RISK_PREFERENCES: Array<OnboardingOption<RiskPreference>> = [
  { copy: "優先降低回撤與不確定性。", id: "conservative", label: "保守" },
  { copy: "在機會與風險之間保持平衡。", id: "balanced", label: "中性" },
  { copy: "可接受較高波動以追求成長。", id: "aggressive", label: "積極" },
];

export const INTELLIGENCE_INTERESTS: Array<OnboardingOption<IntelligenceInterest>> = [
  { copy: "每日市場結構與風險焦點。", id: "daily_brief", label: "Daily Brief" },
  { copy: "將自選名單變成情報入口。", id: "ai_watchlist", label: "AI Watchlist" },
  { copy: "FCN 教育與未來風險工作流。", id: "fcn_intelligence", label: "FCN Intelligence" },
  { copy: "利率、美元、VIX 與總經壓力。", id: "macro_risk", label: "Macro Risk" },
  { copy: "BTC / ETH 波動與風險偏好。", id: "btc_eth_alert", label: "BTC / ETH Alert" },
  { copy: "AI 供應鏈與風險監控。", id: "ai_risk_monitor", label: "AI Risk Monitor" },
];

export const WATCHLIST_ASSET_TYPES: Array<OnboardingOption<WatchlistAssetType>> = [
  { copy: "股票或台美個股代碼。", id: "stock", label: "股票" },
  { copy: "BTC、ETH、SOL 等幣種。", id: "crypto", label: "幣種" },
  { copy: "ETF 或指數型商品。", id: "etf", label: "ETF" },
];

export function createInitialOnboardingProfile(): OnboardingProfile {
  return {
    currentStep: 0,
    interests: [],
    lineIntent: false,
    markets: [],
    styles: [],
    watchlist: [],
  };
}

export function normalizeWatchlistSymbol(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase().slice(0, 18);
}

export function summarizeOnboardingProfile(profile: OnboardingProfile) {
  return {
    interestCount: profile.interests.length,
    lineIntent: profile.lineIntent,
    marketCount: profile.markets.length,
    riskPreference: profile.riskPreference ?? "unset",
    styleCount: profile.styles.length,
    watchlistCount: profile.watchlist.length,
  };
}

export function parseOnboardingProfile(value: string | null): OnboardingProfile {
  if (!value) {
    return createInitialOnboardingProfile();
  }

  try {
    const parsed = JSON.parse(value) as Partial<OnboardingProfile>;

    return {
      ...createInitialOnboardingProfile(),
      ...parsed,
      currentStep: Number.isFinite(parsed.currentStep) ? Number(parsed.currentStep) : 0,
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      markets: Array.isArray(parsed.markets) ? parsed.markets : [],
      styles: Array.isArray(parsed.styles) ? parsed.styles : [],
      watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist : [],
    };
  } catch {
    return createInitialOnboardingProfile();
  }
}
