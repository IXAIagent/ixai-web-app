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
      sections={[
        {
          copy: "Coming soon: portfolio-level risk state once account data can be safely connected.",
          title: "Portfolio Risk",
        },
        {
          copy: "Coming soon: concentration checks across asset class, sector, theme, and currency exposure.",
          title: "Concentration Risk",
        },
        {
          copy: "Coming soon: scenario workspace for rates, volatility, AI drawdown, and liquidity stress.",
          title: "Scenario Monitor",
        },
        {
          copy: "Coming soon: AI alert placeholders for risk awareness. No buy/sell signals are generated.",
          title: "AI Alerts",
        },
      ]}
    />
  );
}
