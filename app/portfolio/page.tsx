import { FeatureGatedPage } from "@/components/pro/feature-gated-page";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "Portfolio Intelligence | IXAI Pro",
  description:
    "Portfolio Intelligence is a future IXAI Pro module controlled by membership entitlements.",
  canonical: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <FeatureGatedPage
      description="Portfolio Intelligence will connect account-linked portfolio context to market intelligence after Pro entitlement is enabled."
      feature="portfolio"
      moduleName="Portfolio Intelligence"
    />
  );
}
