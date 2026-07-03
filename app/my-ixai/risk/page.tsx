import { RiskExperienceWorkspace } from "@/components/risk/risk-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/risk",
  description:
    "Today’s Risk Workspace 以使用者語言整理今日風險、主要原因、alerts、exposure 與進階診斷。",
  title: "Today’s Risk | 我的 IXAI",
});

export default function MyIxaiRiskPage() {
  return <RiskExperienceWorkspace />;
}
