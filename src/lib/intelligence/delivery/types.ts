import type { IntelligenceInterest } from "@/src/lib/onboarding/profile";

export type IntelligenceDeliveryTier = "public" | "preview" | "pro";

export type IntelligenceDeliveryCategory =
  | "morning_intelligence"
  | "macro_intelligence"
  | "watchlist_alert"
  | "market_volatility_alert"
  | "fcn_intelligence_preview";

export type IntelligenceDeliveryChannel = "line" | "app" | "email";

export type DeliveryPreferenceState = {
  channels: IntelligenceDeliveryChannel[];
  enabled: boolean;
  interests: IntelligenceInterest[];
  preferredLocalTime: string;
  quietHours: {
    end: string;
    start: string;
  };
  tier: IntelligenceDeliveryTier;
};

export type IntelligenceDeliveryItem = {
  category: IntelligenceDeliveryCategory;
  copy: string;
  tier: IntelligenceDeliveryTier;
  title: string;
};

export type IntelligenceDeliveryMessage = {
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
  items: IntelligenceDeliveryItem[];
  title: string;
  tier: IntelligenceDeliveryTier;
};

export type DeliveryScheduleDefinition = {
  category: IntelligenceDeliveryCategory;
  cadence: "daily" | "event_driven" | "weekly";
  channel: IntelligenceDeliveryChannel;
  localTime?: string;
  tier: IntelligenceDeliveryTier;
};

export type DeliveryAccessResult = {
  allowed: boolean;
  reason: string;
  requiredTier?: IntelligenceDeliveryTier;
  tier: IntelligenceDeliveryTier;
};
