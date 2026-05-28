import type {
  IntelligenceDeliveryItem,
  IntelligenceDeliveryMessage,
  IntelligenceDeliveryTier,
} from "@/src/lib/intelligence/delivery/types";

export const PUBLIC_MORNING_ITEMS: IntelligenceDeliveryItem[] = [
  {
    category: "morning_intelligence",
    copy: "美股期貨與大型科技股風險偏好是今日開盤前第一觀察。",
    tier: "public",
    title: "美股風險偏好",
  },
  {
    category: "macro_intelligence",
    copy: "美元、美債與 VIX 仍是科技估值壓力的主要背景。",
    tier: "public",
    title: "Macro Risk",
  },
  {
    category: "watchlist_alert",
    copy: "Watchlist delivery 目前為 preview；未來會依你的自選名單調整。",
    tier: "preview",
    title: "AI Watchlist",
  },
  {
    category: "fcn_intelligence_preview",
    copy: "FCN 只提供教育型風險觀察；個人化 KI / KO 監控屬於未來 Pro。",
    tier: "preview",
    title: "FCN Intelligence Preview",
  },
];

export function buildMorningIntelligenceMessage(
  tier: IntelligenceDeliveryTier = "public",
): IntelligenceDeliveryMessage {
  const items =
    tier === "pro"
      ? [
          ...PUBLIC_MORNING_ITEMS,
          {
            category: "market_volatility_alert" as const,
            copy: "Pro sample：未來可把波動窗口映射到個人 Watchlist 與 portfolio exposure。",
            tier: "pro" as const,
            title: "Personal Risk Window",
          },
        ]
      : PUBLIC_MORNING_ITEMS;

  return {
    ctaLabel: tier === "pro" ? "查看 Pro Intelligence" : "查看 Daily Brief",
    ctaUrl: tier === "pro" ? "/pro-intelligence" : "/daily-brief",
    footer: "內容僅供市場資訊與風險觀察參考，不構成投資建議、買賣指令或報酬承諾。",
    items,
    title: "☀️ IXAI Morning Intelligence",
    tier,
  };
}

export function formatDeliveryPreview(message: IntelligenceDeliveryMessage) {
  return [
    message.title,
    ...message.items.map((item) => `• ${item.title}: ${item.copy}`),
    "",
    message.footer,
  ].join("\n");
}
