import type { IntelligenceAlertPreferences } from "@/src/lib/intelligence/alerts/alert-types";

export function buildDefaultAlertPreferences(
  patch: Partial<IntelligenceAlertPreferences> = {},
): IntelligenceAlertPreferences {
  return {
    channelAvailability: {
      "browser-push": false,
      email: false,
      "in-app": true,
      line: false,
      "mobile-push": false,
      telegram: false,
      ...(patch.channelAvailability ?? {}),
    },
    cooldownHours: {
      critical: 2,
      info: 24,
      warning: 6,
      ...(patch.cooldownHours ?? {}),
    },
    enabledRuleFamilies: patch.enabledRuleFamilies ?? [
      "data-quality",
      "fcn",
      "market",
      "portfolio",
      "provider",
      "risk",
      "watchlist",
    ],
    externalDeliveryEnabled: false,
    minimumNotificationPriority: patch.minimumNotificationPriority ?? "low",
    quietHours: {
      enabled: false,
      end: "08:00",
      start: "22:00",
      timezone: "Asia/Taipei",
      ...(patch.quietHours ?? {}),
    },
  };
}
