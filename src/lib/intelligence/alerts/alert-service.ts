import { correlateAlertCandidates } from "@/src/lib/intelligence/alerts/alert-correlation";
import { buildAlertDiagnostics } from "@/src/lib/intelligence/alerts/alert-diagnostics";
import { getAlertNotificationPreview } from "@/src/lib/intelligence/alerts/alert-notification-orchestrator";
import { buildDefaultAlertPreferences } from "@/src/lib/intelligence/alerts/alert-preferences";
import { runAlertRules } from "@/src/lib/intelligence/alerts/alert-rules";
import type {
  IntelligenceAlertServiceInput,
  IntelligenceAlertSnapshot,
} from "@/src/lib/intelligence/alerts/alert-types";
import { getIntelligencePlatformSnapshot } from "@/src/lib/intelligence/platform";

export async function getIntelligenceAlertSnapshot(
  input: IntelligenceAlertServiceInput = {},
): Promise<IntelligenceAlertSnapshot> {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const platformSnapshot = input.platformSnapshot ?? await getIntelligencePlatformSnapshot({
    generatedAt,
  });
  const preferences = buildDefaultAlertPreferences(input.preferences);
  const candidates = runAlertRules({
    generatedAt,
    platformSnapshot,
  }).filter((candidate) => preferences.enabledRuleFamilies.includes(candidate.ruleFamily));
  const alerts = correlateAlertCandidates(candidates);
  const notificationPreview = getAlertNotificationPreview({
    alerts,
    existingNotifications: input.existingNotifications,
    generatedAt,
    preferences,
  });

  return {
    alerts,
    diagnostics: buildAlertDiagnostics({
      alerts,
      generatedAt,
      notificationPreview,
      preferences,
    }),
    generatedAt,
    notificationPreview,
    platformSnapshot,
    preferences,
  };
}

export async function getIntelligenceAlerts(input: IntelligenceAlertServiceInput = {}) {
  return (await getIntelligenceAlertSnapshot(input)).alerts;
}

export async function getIntelligenceAlertDiagnostics(input: IntelligenceAlertServiceInput = {}) {
  return (await getIntelligenceAlertSnapshot(input)).diagnostics;
}

export async function getIntelligenceAlertNotificationPreview(input: IntelligenceAlertServiceInput = {}) {
  return (await getIntelligenceAlertSnapshot(input)).notificationPreview;
}
