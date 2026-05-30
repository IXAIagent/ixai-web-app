import {
  ONBOARDING_PROFILE_STORAGE_KEY,
  parseOnboardingProfile,
  type IntelligenceInterest,
  type OnboardingMarket,
} from "@/src/lib/onboarding/profile";
import type {
  DistributionCategory,
  DistributionCategoryOption,
  DistributionChannelOption,
  DistributionFrequency,
  DistributionFrequencyOption,
  DistributionPreference,
  DistributionPreferenceSeed,
} from "@/src/lib/intelligence/distribution/types";

export const DISTRIBUTION_PREFERENCES_STORAGE_KEY = "ixai.distribution.preferences.v1";

export const DISTRIBUTION_FREQUENCY_OPTIONS: DistributionFrequencyOption[] = [
  {
    copy: "每日整理公開市場情報，適合建立 daily intelligence habit。",
    id: "daily",
    label: "Daily",
  },
  {
    copy: "每週彙整市場結構、風險狀態與主要觀察題材。",
    id: "weekly",
    label: "Weekly",
  },
  {
    copy: "同時保留每日節奏與週度回顧，未來可接分發佇列。",
    id: "daily_weekly",
    label: "Daily + Weekly",
  },
];

export const DISTRIBUTION_CATEGORY_OPTIONS: DistributionCategoryOption[] = [
  {
    copy: "Fed、利率、美元、通膨與總經風險脈絡。",
    id: "macro",
    label: "Macro",
  },
  {
    copy: "AI infrastructure、semiconductors、cloud 與大型科技股觀察。",
    id: "ai_tech",
    label: "AI / Tech",
  },
  {
    copy: "BTC、ETH、stablecoin、ETF flow 與 crypto liquidity awareness。",
    id: "crypto",
    label: "Crypto",
  },
  {
    copy: "台股、半導體、AI 供應鏈與 Taiwan market awareness。",
    id: "taiwan_market",
    label: "Taiwan Market",
  },
  {
    copy: "KO、KI、worst performer、observation date 等 FCN 教育脈絡。",
    id: "fcn_awareness",
    label: "FCN Awareness",
  },
  {
    copy: "Calm / Neutral / Elevated / Stress 等公開風險狀態解讀。",
    id: "risk_regime",
    label: "Risk Regime",
  },
];

export const DISTRIBUTION_CHANNEL_OPTIONS: DistributionChannelOption[] = [
  {
    copy: "目前唯一啟用的 delivery surface；只影響 IXAI App 內偏好。",
    id: "in_app",
    label: "In-App",
    status: "active",
  },
  {
    copy: "預留給未來明確 opt-in 與 delivery log；本版不啟用推送。",
    id: "line",
    label: "LINE",
    status: "future",
  },
  {
    copy: "預留給未來 email digest；本版不寄送 email。",
    id: "email",
    label: "Email",
    status: "future",
  },
  {
    copy: "預留給未來 push notification；本版不啟用通知。",
    id: "push",
    label: "Push",
    status: "future",
  },
];

export const DEFAULT_DISTRIBUTION_PREFERENCES: DistributionPreference = {
  categories: ["macro", "ai_tech", "risk_regime"],
  channels: ["in_app"],
  frequency: "daily_weekly",
  mode: "local_session",
  status: "readiness",
};

const validFrequencies = new Set<DistributionFrequency>(
  DISTRIBUTION_FREQUENCY_OPTIONS.map((option) => option.id),
);

const validCategories = new Set<DistributionCategory>(
  DISTRIBUTION_CATEGORY_OPTIONS.map((option) => option.id),
);

function isDistributionFrequency(value: unknown): value is DistributionFrequency {
  return typeof value === "string" && validFrequencies.has(value as DistributionFrequency);
}

function isDistributionCategory(value: unknown): value is DistributionCategory {
  return typeof value === "string" && validCategories.has(value as DistributionCategory);
}

function uniqueCategories(categories: DistributionCategory[]) {
  return Array.from(new Set(categories));
}

export function deriveDistributionCategoriesFromSeed(
  seed: DistributionPreferenceSeed,
): DistributionCategory[] {
  const categories: DistributionCategory[] = [];
  const interests = new Set<IntelligenceInterest>(seed.interests);
  const markets = new Set<OnboardingMarket>(seed.markets);

  if (interests.has("macro_risk")) {
    categories.push("macro", "risk_regime");
  }

  if (interests.has("ai_watchlist") || interests.has("ai_risk_monitor") || markets.has("us_equities")) {
    categories.push("ai_tech");
  }

  if (interests.has("btc_eth_alert") || markets.has("crypto")) {
    categories.push("crypto");
  }

  if (markets.has("taiwan_equities")) {
    categories.push("taiwan_market");
  }

  if (interests.has("fcn_intelligence") || markets.has("fcn")) {
    categories.push("fcn_awareness", "risk_regime");
  }

  return uniqueCategories(categories.length ? categories : DEFAULT_DISTRIBUTION_PREFERENCES.categories);
}

export function deriveDistributionPreferencesFromOnboarding(
  onboardingValue: string | null,
): DistributionPreference {
  const onboarding = parseOnboardingProfile(onboardingValue);

  return {
    ...DEFAULT_DISTRIBUTION_PREFERENCES,
    categories: deriveDistributionCategoriesFromSeed({
      interests: onboarding.interests,
      markets: onboarding.markets,
    }),
    frequency: onboarding.completedAt ? "daily_weekly" : DEFAULT_DISTRIBUTION_PREFERENCES.frequency,
  };
}

export function mergeDistributionPreferences(
  current: DistributionPreference,
  updates: Partial<DistributionPreference>,
): DistributionPreference {
  return {
    ...current,
    ...updates,
    categories:
      updates.categories?.filter(isDistributionCategory).length
        ? uniqueCategories(updates.categories.filter(isDistributionCategory))
        : current.categories,
    channels: ["in_app"],
    frequency: isDistributionFrequency(updates.frequency) ? updates.frequency : current.frequency,
    lastUpdatedAt: updates.lastUpdatedAt ?? current.lastUpdatedAt,
    mode: "local_session",
    status: "readiness",
  };
}

export function readDistributionPreferences(): DistributionPreference {
  if (typeof window === "undefined") {
    return DEFAULT_DISTRIBUTION_PREFERENCES;
  }

  try {
    const saved = window.localStorage.getItem(DISTRIBUTION_PREFERENCES_STORAGE_KEY);

    if (saved) {
      return mergeDistributionPreferences(
        DEFAULT_DISTRIBUTION_PREFERENCES,
        JSON.parse(saved) as Partial<DistributionPreference>,
      );
    }

    return deriveDistributionPreferencesFromOnboarding(
      window.localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_DISTRIBUTION_PREFERENCES;
  }
}

export function writeDistributionPreferences(preferences: DistributionPreference) {
  if (typeof window === "undefined") {
    return preferences;
  }

  const next = mergeDistributionPreferences(preferences, {
    lastUpdatedAt: new Date().toISOString(),
  });

  try {
    window.localStorage.setItem(DISTRIBUTION_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("ixai-distribution-preferences-change"));
  } catch {
    // Local/session-first preferences should never block account usage.
  }

  return next;
}

export function toggleDistributionCategory(
  current: DistributionPreference,
  category: DistributionCategory,
): DistributionPreference {
  const categories = current.categories.includes(category)
    ? current.categories.filter((item) => item !== category)
    : [...current.categories, category];

  return writeDistributionPreferences({
    ...current,
    categories: categories.length ? categories : [category],
  });
}

export function setDistributionFrequency(
  current: DistributionPreference,
  frequency: DistributionFrequency,
): DistributionPreference {
  return writeDistributionPreferences({
    ...current,
    frequency,
  });
}

