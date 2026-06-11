import { Settings } from "lucide-react";

import { WorkspacePlaceholder } from "@/components/my-ixai/workspace-placeholder";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/settings",
  description:
    "Settings 是 v3.00 account and preference route foundation，未來承接帳號、會員、通知、語言、地區與 broker connections。",
  title: "Settings | 我的 IXAI",
});

export default function MyIxaiSettingsPage() {
  return (
    <WorkspacePlaceholder
      description="Settings 將承接帳號、會員、通知、語言、地區與 broker connections。v3.00 不改 auth 或 membership logic。"
      eyebrow="Settings"
      icon={Settings}
      links={[
        { href: "/account", label: "Account" },
        { href: "/settings/notifications", label: "Notification Settings" },
      ]}
      ownerItems={[
        "Account future owner。",
        "Membership and entitlement display future owner。",
        "Notifications future owner。",
        "Language and region preferences future owner。",
        "Broker connections future owner。",
      ]}
      title="Settings：帳號與偏好設定"
    />
  );
}
