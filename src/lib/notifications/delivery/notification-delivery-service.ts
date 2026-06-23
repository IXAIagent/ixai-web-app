import type { NotificationDeliveryReadiness } from "@/src/lib/notifications/delivery/notification-delivery-types";

export function getNotificationDeliveryReadiness(): NotificationDeliveryReadiness {
  const channels = [
    {
      channel: "in_app" as const,
      configured: true,
      description: "Local in-app notification readback is active.",
      status: "active" as const,
    },
    {
      channel: "email" as const,
      configured: false,
      description: "Email delivery is planned and disabled by default.",
      status: "planned" as const,
    },
    {
      channel: "telegram" as const,
      configured: false,
      description: "Telegram delivery is planned and disabled by default.",
      status: "planned" as const,
    },
    {
      channel: "line" as const,
      configured: false,
      description: "LINE delivery is planned and disabled by default.",
      status: "planned" as const,
    },
  ];

  return {
    channels,
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Notification delivery is a readiness foundation only. No email, Telegram, LINE, or external delivery is sent.",
    readyChannelCount: channels.filter((channel) => channel.status === "active").length,
    summary:
      "In-app notification readback is available. External delivery channels are planned but disabled.",
  };
}
