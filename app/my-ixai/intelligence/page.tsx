import { IntelligenceCenterWorkspace } from "@/components/intelligence/intelligence-center-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/intelligence",
  description:
    "Intelligence Center v1 整合 Daily / Weekly 入口、FCN highlights、portfolio-aware readiness、market source、news readiness 與 commentary readiness。",
  title: "Intelligence Center | 我的 IXAI",
});

export default function MyIxaiIntelligencePage() {
  return <IntelligenceCenterWorkspace />;
}
