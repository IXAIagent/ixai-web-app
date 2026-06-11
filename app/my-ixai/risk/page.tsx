import { ShieldAlert } from "lucide-react";

import { WorkspacePlaceholder } from "@/components/my-ixai/workspace-placeholder";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/risk",
  description:
    "Risk Center 是 v3.00 風險工作區 route foundation，未來承接 concentration、correlation、scenario、stress test 與 risk summaries。",
  title: "Risk Center | 我的 IXAI",
});

export default function MyIxaiRiskPage() {
  return (
    <WorkspacePlaceholder
      description="Risk Center 未來承接 Portfolio Center 中過重的風險模組。v3.00 只建立資訊架構，不搬移 business logic。"
      eyebrow="Risk Center"
      icon={ShieldAlert}
      links={[
        { href: "/my-ixai/portfolio", label: "Portfolio Center" },
        { href: "/risk", label: "Public Risk Page" },
      ]}
      ownerItems={[
        "Concentration Engine future owner。",
        "Correlation Engine future owner。",
        "Scenario Engine future owner。",
        "Stress Test Engine future owner。",
        "Portfolio risk summaries future owner。",
      ]}
      title="Risk Center：風險工作區"
    />
  );
}
