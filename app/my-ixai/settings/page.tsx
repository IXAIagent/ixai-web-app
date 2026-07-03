import { SettingsExperienceWorkspace } from "@/components/settings/settings-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/settings",
  description:
    "Settings 是 IXAI Workspace 的帳號、偏好、通知、語言、地區與未來 broker connection 設定預覽。",
  title: "Settings | 我的 IXAI",
});

export default function MyIxaiSettingsPage() {
  return <SettingsExperienceWorkspace />;
}
