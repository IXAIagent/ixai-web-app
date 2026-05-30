import type { IntelligenceInterest, OnboardingMarket } from "@/src/lib/onboarding/profile";

export type DistributionFrequency = "daily" | "weekly" | "daily_weekly";

export type DistributionCategory =
  | "macro"
  | "ai_tech"
  | "crypto"
  | "taiwan_market"
  | "fcn_awareness"
  | "risk_regime";

export type DistributionChannel = "in_app" | "line" | "email" | "push";

export type DistributionChannelStatus = "active" | "future" | "disabled";

export type DistributionPreference = {
  categories: DistributionCategory[];
  channels: DistributionChannel[];
  frequency: DistributionFrequency;
  lastUpdatedAt?: string;
  mode: "local_session";
  status: "readiness";
};

export type DistributionFrequencyOption = {
  copy: string;
  id: DistributionFrequency;
  label: string;
};

export type DistributionCategoryOption = {
  copy: string;
  id: DistributionCategory;
  label: string;
};

export type DistributionChannelOption = {
  copy: string;
  id: DistributionChannel;
  label: string;
  status: DistributionChannelStatus;
};

export type DistributionQueueStatus = "draft" | "reviewed" | "published";

export type DistributionQueueItem = {
  channel: DistributionChannel;
  id: string;
  kind: "daily" | "weekly" | "social_pack";
  source: string;
  status: DistributionQueueStatus;
  title: string;
  updatedAt: string;
};

export type DistributionQueueSnapshot = {
  counts: Record<DistributionQueueStatus, number>;
  items: DistributionQueueItem[];
  mode: "foundation";
  note: string;
};

export type DistributionPreferenceSeed = {
  interests: IntelligenceInterest[];
  markets: OnboardingMarket[];
};

