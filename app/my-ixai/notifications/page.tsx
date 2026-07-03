import { NotificationsExperienceWorkspace } from "@/components/notifications/notifications-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/notifications",
  description:
    "IXAI Workspace Notification Center converts alert cards into local notification readback without delivery.",
  title: "Notifications | 我的 IXAI",
});

export default function MyIxaiNotificationsPage() {
  return <NotificationsExperienceWorkspace />;
}
