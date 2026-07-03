import { WorkspaceMorningBriefReport } from "@/components/workspace/workspace-morning-brief-report";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/morning-brief",
  description:
    "IXAI Workspace Morning Brief 是登入後的每日完整報告，整理 Portfolio、Risk、FCN、Watchlist 與時間線脈絡。",
  title: "Morning Brief | 我的 IXAI",
});

export default function MyIxaiMorningBriefPage() {
  return <WorkspaceMorningBriefReport />;
}
