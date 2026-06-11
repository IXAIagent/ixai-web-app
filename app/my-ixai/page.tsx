import { LayoutDashboard } from "lucide-react";

import { WorkspacePlaceholder } from "@/components/my-ixai/workspace-placeholder";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai",
  description:
    "我的 IXAI 是 v3.00 workspace route foundation，整理 Home、Portfolio、Risk、FCN、Intelligence 與 Settings 的未來入口。",
  title: "我的 IXAI Workspace",
});

export default function MyIxaiWorkspacePage() {
  return (
    <WorkspacePlaceholder
      description="v3.00 將 IXAI 從 engine foundation 轉向 product workspace。這裡先建立中心入口，不新增新功能。"
      eyebrow="My IXAI Workspace"
      icon={LayoutDashboard}
      links={[
        { href: "/my-ixai/home", label: "Home" },
        { href: "/my-ixai/portfolio", label: "Portfolio Center" },
        { href: "/my-ixai/risk", label: "Risk Center" },
        { href: "/my-ixai/fcn", label: "FCN Center" },
        { href: "/my-ixai/intelligence", label: "Intelligence Center" },
        { href: "/my-ixai/settings", label: "Settings" },
      ]}
      ownerItems={[
        "Home：登入後摘要與下一步工作流入口。",
        "Portfolio Center：資產、部位、估值、配置與曝險。",
        "Risk Center：集中度、相關性、情境、壓力測試與風險摘要。",
        "FCN Center：FCN 部位、underlyings、Worst-of、KI / KO 與票息排程。",
        "Intelligence Center：Daily、Weekly、News、Commentary 與 recommendation surfaces。",
        "Settings：帳號、會員、通知、語言、地區與 broker connections。",
      ]}
      title="我的 IXAI：Workspace Foundation"
    />
  );
}
