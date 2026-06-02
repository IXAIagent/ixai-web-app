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
      sections={[
        {
          copy: "Coming soon: a linked account overview that can later summarize total exposure without connecting brokers in this beta.",
          title: "Portfolio Overview",
        },
        {
          copy: "Coming soon: allocation cards for asset class, currency, and thematic exposure once real portfolio data is connected.",
          title: "Asset Allocation",
        },
        {
          copy: "Coming soon: position-level workspace. No holdings, broker data, or trade execution are loaded in v1.58.",
          title: "Positions",
        },
        {
          copy: "Coming soon: AI notes that connect market intelligence to portfolio context without giving buy/sell instructions.",
          title: "AI Portfolio Notes",
        },
      ]}
    />
  );
}
