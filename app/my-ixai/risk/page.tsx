import { RiskExperienceWorkspace } from "@/components/risk/risk-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/risk",
  description:
    "IXAI Risk 整理今日風險、主要原因、受影響資產與接下來要留意的事項。",
  title: "Today’s Risk | 我的 IXAI",
});

export default function MyIxaiRiskPage() {
  return <RiskExperienceWorkspace />;
}
