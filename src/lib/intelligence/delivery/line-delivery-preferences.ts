export type LineDeliveryChannel = "line" | "none";

export type LineDeliveryStatus = "not_connected" | "paused" | "ready";

export type LineDeliveryPreferenceKey =
  | "dailyMorningBrief"
  | "fcnAwareness"
  | "marketPulse"
  | "riskRegime"
  | "watchlistLite"
  | "weeklyIntelligence";

export type LineDeliveryPreferenceState = {
  dailyMorningBrief: boolean;
  deliveryChannel: LineDeliveryChannel;
  deliveryStatus: LineDeliveryStatus;
  fcnAwareness: boolean;
  lastUpdatedAt: string;
  marketPulse: boolean;
  riskRegime: boolean;
  watchlistLite: boolean;
  weeklyIntelligence: boolean;
};

export const LINE_DELIVERY_PREFERENCES_STORAGE_KEY =
  "ixai.line.delivery.preferences.v1";

export const DEFAULT_LINE_DELIVERY_PREFERENCES: LineDeliveryPreferenceState = {
  dailyMorningBrief: true,
  deliveryChannel: "none",
  deliveryStatus: "not_connected",
  fcnAwareness: false,
  lastUpdatedAt: "",
  marketPulse: true,
  riskRegime: true,
  watchlistLite: true,
  weeklyIntelligence: true,
};

const preferenceKeys: LineDeliveryPreferenceKey[] = [
  "dailyMorningBrief",
  "weeklyIntelligence",
  "marketPulse",
  "watchlistLite",
  "fcnAwareness",
  "riskRegime",
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function withTimestamp(
  preferences: LineDeliveryPreferenceState,
): LineDeliveryPreferenceState {
  return {
    ...preferences,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function mergeLineDeliveryPreferences(
  updates: Partial<LineDeliveryPreferenceState>,
  current: LineDeliveryPreferenceState = DEFAULT_LINE_DELIVERY_PREFERENCES,
): LineDeliveryPreferenceState {
  const next: LineDeliveryPreferenceState = {
    ...current,
    ...updates,
    deliveryChannel:
      updates.deliveryChannel === "line" || updates.deliveryChannel === "none"
        ? updates.deliveryChannel
        : current.deliveryChannel,
    deliveryStatus:
      updates.deliveryStatus === "ready" ||
      updates.deliveryStatus === "paused" ||
      updates.deliveryStatus === "not_connected"
        ? updates.deliveryStatus
        : current.deliveryStatus,
  };

  for (const key of preferenceKeys) {
    next[key] = typeof updates[key] === "boolean" ? updates[key] : current[key];
  }

  return next;
}

export function readLineDeliveryPreferences(): LineDeliveryPreferenceState {
  if (!canUseStorage()) {
    return DEFAULT_LINE_DELIVERY_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(LINE_DELIVERY_PREFERENCES_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_LINE_DELIVERY_PREFERENCES;
    }

    return mergeLineDeliveryPreferences(
      JSON.parse(raw) as Partial<LineDeliveryPreferenceState>,
    );
  } catch {
    return DEFAULT_LINE_DELIVERY_PREFERENCES;
  }
}

export function writeLineDeliveryPreferences(
  preferences: LineDeliveryPreferenceState,
) {
  if (!canUseStorage()) {
    return preferences;
  }

  const next = withTimestamp(preferences);

  try {
    window.localStorage.setItem(
      LINE_DELIVERY_PREFERENCES_STORAGE_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(new Event("ixai-line-delivery-preferences-change"));
  } catch {
    // Local/session-first preferences should never block app usage.
  }

  return next;
}

export function setLineDeliveryStatus(
  current: LineDeliveryPreferenceState,
  status: LineDeliveryStatus,
  lineConnected: boolean,
): LineDeliveryPreferenceState {
  if (status === "not_connected" || !lineConnected) {
    return writeLineDeliveryPreferences({
      ...current,
      deliveryChannel: "none",
      deliveryStatus: "not_connected",
    });
  }

  return writeLineDeliveryPreferences({
    ...current,
    deliveryChannel: "line",
    deliveryStatus: status,
  });
}

export function toggleLineDeliveryPreference(
  current: LineDeliveryPreferenceState,
  key: LineDeliveryPreferenceKey,
): LineDeliveryPreferenceState {
  return writeLineDeliveryPreferences({
    ...current,
    [key]: !current[key],
  });
}
