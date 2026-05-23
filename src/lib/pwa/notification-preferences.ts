// v1.27 push foundation — local notification preference store.
// LocalStorage only; no Supabase schema change. Server sync arrives with the
// Pro layer once real dispatch is wired.

export const NOTIFICATION_PREFERENCES_STORAGE_KEY = "ixai_notification_preferences";

export type NotificationChannelKey =
  | "dailyBrief"
  | "marketRisk"
  | "taiwanAi"
  | "crypto"
  | "proUpdates";

export type NotificationPreferences = Record<NotificationChannelKey, boolean>;

export type NotificationChannelDefinition = {
  key: NotificationChannelKey;
  label: string;
  description: string;
};

export const NOTIFICATION_CHANNELS: NotificationChannelDefinition[] = [
  {
    key: "dailyBrief",
    label: "Daily Brief 通知",
    description: "新的每日市場摘要與一玄觀點發布時通知。",
  },
  {
    key: "marketRisk",
    label: "市場重大風險",
    description: "VIX、利率、美元或地緣事件觸碰風險門檻時提醒。",
  },
  {
    key: "taiwanAi",
    label: "台股 AI 新聞",
    description: "台積電、AI 伺服器與半導體供應鏈的高權重訊號。",
  },
  {
    key: "crypto",
    label: "Crypto 市場異動",
    description: "BTC / ETH 與 Crypto 流動性出現顯著變化時通知。",
  },
  {
    key: "proUpdates",
    label: "IXAI Pro Updates",
    description: "IXAI Pro 開放測試、新功能與 waitlist 邀請。",
  },
];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  dailyBrief: true,
  marketRisk: true,
  taiwanAi: false,
  crypto: false,
  proUpdates: true,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadNotificationPreferences(): NotificationPreferences {
  if (!isBrowser()) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);

    if (!raw) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    const merged = { ...DEFAULT_NOTIFICATION_PREFERENCES };

    for (const channel of NOTIFICATION_CHANNELS) {
      if (typeof parsed[channel.key] === "boolean") {
        merged[channel.key] = parsed[channel.key] as boolean;
      }
    }

    return merged;
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      NOTIFICATION_PREFERENCES_STORAGE_KEY,
      JSON.stringify(prefs),
    );
  } catch {
    // localStorage quota / privacy mode failures should not break UX.
  }
}

export function updateNotificationPreference(
  prefs: NotificationPreferences,
  key: NotificationChannelKey,
  value: boolean,
): NotificationPreferences {
  return { ...prefs, [key]: value };
}
