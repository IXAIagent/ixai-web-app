import { FeatureGatedPage } from "@/components/pro/feature-gated-page";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "Risk Engine | IXAI Pro",
  description:
    "Risk Engine is a future IXAI Pro module controlled by membership entitlements.",
  canonical: "/risk",
});

export default function RiskPage() {
  return (
    <FeatureGatedPage
      description="Risk Engine will turn portfolio, FCN, market regime, and watchlist context into risk-aware workflows after entitlement is enabled."
      feature="risk_engine"
      moduleName="Risk Engine"
    />
  );
}
