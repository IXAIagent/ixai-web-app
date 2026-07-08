import { IntelligenceExperienceWorkspace } from "@/components/intelligence/intelligence-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/intelligence",
  description:
    "IXAI Intelligence explains what today's market means for your portfolio in user-facing language.",
  title: "Intelligence | 我的 IXAI",
});

export default function MyIxaiIntelligencePage() {
  return <IntelligenceExperienceWorkspace />;
}
