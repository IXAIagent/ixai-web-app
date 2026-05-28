import { getLineConfigState } from "@/src/lib/line/config";
import type { IntelligenceDeliveryMessage } from "@/src/lib/intelligence/delivery/types";

export type LineTextMessage = {
  text: string;
  type: "text";
};

export type LineDeliveryBuildResult = {
  message: LineTextMessage;
  mode: "line-ready" | "mock";
  reason: string;
};

export function buildLineIntelligenceMessage(
  delivery: IntelligenceDeliveryMessage,
): LineDeliveryBuildResult {
  const config = getLineConfigState();
  const lines = [
    delivery.title,
    "",
    ...delivery.items.map((item) => `• ${item.title}｜${item.copy}`),
    "",
    `${delivery.ctaLabel}: ${delivery.ctaUrl}`,
    delivery.footer,
  ];

  return {
    message: {
      text: lines.join("\n").slice(0, 1800),
      type: "text",
    },
    mode: config.messagingReady ? "line-ready" : "mock",
    reason: config.messagingReady
      ? "LINE Messaging API token is configured. Sending remains opt-in and future-scheduled."
      : "LINE Messaging API token is not configured. Delivery preview is running in mock mode.",
  };
}
