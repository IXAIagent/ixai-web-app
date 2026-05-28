import {
  INTELLIGENCE_INTERESTS,
  ONBOARDING_PROFILE_STORAGE_KEY,
  parseOnboardingProfile,
  type IntelligenceInterest,
} from "@/src/lib/onboarding/profile";
import type { DeliveryPreferenceState, IntelligenceDeliveryTier } from "@/src/lib/intelligence/delivery/types";

export const DELIVERY_PREFERENCES_STORAGE_KEY = "ixai.delivery.preferences.v1";

export const DEFAULT_DELIVERY_PREFERENCES: DeliveryPreferenceState = {
  channels: ["app"],
  enabled: false,
  interests: ["daily_brief", "macro_risk"],
  preferredLocalTime: "08:00",
  quietHours: {
    end: "07:30",
    start: "22:00",
  },
  tier: "public",
};

export function isIntelligenceInterest(value: string): value is IntelligenceInterest {
  return INTELLIGENCE_INTERESTS.some((interest) => interest.id === value);
}

export function mergeDeliveryPreferences(
  current: DeliveryPreferenceState,
  updates: Partial<DeliveryPreferenceState>,
): DeliveryPreferenceState {
  return {
    ...current,
    ...updates,
    channels: updates.channels ?? current.channels,
    interests: updates.interests?.filter(isIntelligenceInterest) ?? current.interests,
    quietHours: {
      ...current.quietHours,
      ...updates.quietHours,
    },
  };
}

export function derivePreferencesFromOnboarding(
  onboardingValue: string | null,
  tier: IntelligenceDeliveryTier = "public",
): DeliveryPreferenceState {
  const onboarding = parseOnboardingProfile(onboardingValue);
  const interests = onboarding.interests.length
    ? onboarding.interests
    : DEFAULT_DELIVERY_PREFERENCES.interests;

  return {
    ...DEFAULT_DELIVERY_PREFERENCES,
    enabled: Boolean(onboarding.completedAt),
    interests,
    tier,
  };
}

export function readInitialDeliveryPreferences(): DeliveryPreferenceState {
  if (typeof window === "undefined") {
    return DEFAULT_DELIVERY_PREFERENCES;
  }

  try {
    const saved = window.localStorage.getItem(DELIVERY_PREFERENCES_STORAGE_KEY);

    if (saved) {
      return mergeDeliveryPreferences(DEFAULT_DELIVERY_PREFERENCES, JSON.parse(saved));
    }

    return derivePreferencesFromOnboarding(
      window.localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_DELIVERY_PREFERENCES;
  }
}

export function writeDeliveryPreferences(preferences: DeliveryPreferenceState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DELIVERY_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Private browsing / quota failures should not block the app.
  }
}
