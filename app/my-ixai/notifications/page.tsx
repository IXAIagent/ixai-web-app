import { NotificationsExperienceWorkspace } from "@/components/notifications/notifications-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/notifications",
  description:
    "IXAI Notifications 整理目前需要注意、稍後查看、已完成與歷史提醒。",
  title: "Notifications | 我的 IXAI",
});

export default function MyIxaiNotificationsPage() {
  return <NotificationsExperienceWorkspace />;
}
