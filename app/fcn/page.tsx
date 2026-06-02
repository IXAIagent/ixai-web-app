import { FeatureGatedPage } from "@/components/pro/feature-gated-page";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "FCN Monitoring | IXAI Pro",
  description:
    "FCN Monitoring is a future IXAI Pro module controlled by membership entitlements.",
  canonical: "/fcn",
});

export default function FCNPage() {
  return (
    <FeatureGatedPage
      description="FCN Monitoring will connect KI / KO, worst-of, schedule, and structured note risk context after Pro entitlement is enabled."
      feature="fcn_monitoring"
      moduleName="FCN Monitoring"
      sections={[
        {
          copy: "Coming soon: structured note holdings workspace. No real FCN positions are imported in this beta.",
          title: "FCN Holdings",
        },
        {
          copy: "Coming soon: coupon and observation schedule view for linked FCN records.",
          title: "Coupon Schedule",
        },
        {
          copy: "Coming soon: KI / KO awareness view for education and monitoring, not personal product advice.",
          title: "KI / KO Watch",
        },
        {
          copy: "Coming soon: worst-of monitoring to understand which underlying drives structure risk.",
          title: "Worst-of Monitor",
        },
      ]}
    />
  );
}
