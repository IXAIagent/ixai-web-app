import { ShieldCheck } from "lucide-react";

import { WorkspacePlaceholder } from "@/components/my-ixai/workspace-placeholder";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/fcn",
  description:
    "FCN Center 是 v3.00 structured product workspace route foundation，未來承接 FCN positions、FCN Risk、KI / KO monitoring 與 schedules。",
  title: "FCN Center | 我的 IXAI",
});

export default function MyIxaiFcnPage() {
  return (
    <WorkspacePlaceholder
      description="FCN Center 將 structured product workflow 從 generic Portfolio Center 拆出。v3.00 先建立 route foundation。"
      eyebrow="FCN Center"
      icon={ShieldCheck}
      links={[
        { href: "/fcn", label: "FCN Education" },
        { href: "/my-ixai/portfolio", label: "Portfolio Center" },
      ]}
      ownerItems={[
        "FCN positions future owner。",
        "FCN Risk Engine future owner。",
        "KI / KO monitoring future owner。",
        "Observation schedules future owner。",
        "Coupon schedules future owner。",
      ]}
      title="FCN Center：結構型商品工作區"
    />
  );
}
