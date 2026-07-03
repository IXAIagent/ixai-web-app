import { WorkspaceHomeDashboard } from "@/components/home/workspace-home-dashboard";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/home",
  description:
    "IXAI Workspace Home 是登入後主入口，整理 Portfolio、Risk、FCN、Intelligence 與 Settings。",
  title: "Home | 我的 IXAI",
});

export default function MyIxaiHomePage() {
  return <WorkspaceHomeDashboard />;
}
