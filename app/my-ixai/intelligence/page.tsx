import { Newspaper } from "lucide-react";

import { WorkspacePlaceholder } from "@/components/my-ixai/workspace-placeholder";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/intelligence",
  description:
    "Intelligence Center 是 v3.00 intelligence workspace route foundation，未來承接 Daily、Weekly、News、Commentary 與 recommendation surfaces。",
  title: "Intelligence Center | 我的 IXAI",
});

export default function MyIxaiIntelligencePage() {
  return (
    <WorkspacePlaceholder
      description="Intelligence Center 將 public intelligence、portfolio news、commentary 與 recommendation surfaces 收斂成單一閱讀工作區。"
      eyebrow="Intelligence Center"
      icon={Newspaper}
      links={[
        { href: "/daily-brief", label: "Daily Brief" },
        { href: "/weekly-brief", label: "Weekly Intelligence" },
        { href: "/market", label: "Market Overview" },
      ]}
      ownerItems={[
        "Daily Intelligence future owner。",
        "Weekly Intelligence future owner。",
        "News Feed future owner。",
        "AI Commentary future owner。",
        "Recommendation surfaces future owner。",
      ]}
      title="Intelligence Center：情報工作區"
    />
  );
}
