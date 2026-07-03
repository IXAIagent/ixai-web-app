import { IntelligenceExperienceWorkspace } from "@/components/intelligence/intelligence-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/intelligence",
  description:
    "Intelligence Center 整合 Portfolio Truth、Risk Intelligence、FCN highlights、Daily / Weekly 入口、market source 與 readiness boundaries。",
  title: "Intelligence Center | 我的 IXAI",
});

export default function MyIxaiIntelligencePage() {
  return <IntelligenceExperienceWorkspace />;
}
