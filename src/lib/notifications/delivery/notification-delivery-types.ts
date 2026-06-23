export type NotificationDeliveryChannel =
  | "email"
  | "in_app"
  | "line"
  | "telegram";

export type NotificationDeliveryStatus = "active" | "disabled" | "planned";

export interface NotificationDeliveryChannelStatus {
  channel: NotificationDeliveryChannel;
  configured: boolean;
  description: string;
  status: NotificationDeliveryStatus;
}

export interface NotificationDeliveryReadiness {
  channels: NotificationDeliveryChannelStatus[];
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  readyChannelCount: number;
  summary: string;
}
