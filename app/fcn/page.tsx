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
    />
  );
}
