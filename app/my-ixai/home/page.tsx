import { Home } from "lucide-react";

import { WorkspacePlaceholder } from "@/components/my-ixai/workspace-placeholder";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/home",
  description:
    "IXAI Home 是未來登入後工作台入口，將承接 Portfolio summary、Risk summary、FCN alerts 與 Intelligence summary。",
  title: "Home | 我的 IXAI",
});

export default function MyIxaiHomePage() {
  return (
    <WorkspacePlaceholder
      description="未來登入後的每日工作台。v3.00 先建立 route foundation，後續才接入真實 summary 模組。"
      eyebrow="Workspace Home"
      icon={Home}
      links={[
        { href: "/my-ixai/portfolio", label: "Portfolio Center" },
        { href: "/my-ixai/risk", label: "Risk Center" },
        { href: "/my-ixai/intelligence", label: "Intelligence Center" },
      ]}
      ownerItems={[
        "Portfolio summary placeholder。",
        "Risk summary placeholder。",
        "FCN alerts placeholder。",
        "Intelligence summary placeholder。",
      ]}
      title="Home：登入後工作台"
    />
  );
}
