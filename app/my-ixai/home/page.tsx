import { WorkspaceHomeDashboard } from "@/components/home/workspace-home-dashboard";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/home",
  description:
    "IXAI Workspace Home 整理今日資產、風險、市場重點與下一步行動。",
  title: "Home | 我的 IXAI",
});

export default function MyIxaiHomePage() {
  return <WorkspaceHomeDashboard />;
}
