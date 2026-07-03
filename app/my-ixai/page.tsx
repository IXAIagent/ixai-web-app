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
      description="V15 將 Workspace 從工程 dashboard 整理成 AI Wealth Workspace。第一層只保留首頁、我的資產、市場、AI、提醒與設定。"
      eyebrow="AI Wealth Workspace"
      icon={LayoutDashboard}
      links={[
        { href: "/my-ixai/home", label: "首頁" },
        { href: "/my-ixai/portfolio", label: "我的資產" },
        { href: "/my-ixai/watchlist", label: "市場" },
        { href: "/my-ixai/intelligence", label: "AI" },
        { href: "/my-ixai/notifications", label: "提醒" },
        { href: "/my-ixai/settings", label: "設定" },
      ]}
      ownerItems={[
        "首頁：每日摘要、資產、風險、市場與下一步。",
        "我的資產：Portfolio、FCN、Risk 與新增資產。",
        "市場：Watchlist 與近期事件。",
        "AI：Morning Brief、Intelligence 與 Copilot。",
        "提醒：Notifications。",
        "設定：General、Workspace、Language、Notifications、Privacy、About 與 Advanced。",
        "Advanced：System Health、Beta 與進階診斷已移到 Settings 底下。",
      ]}
      title="我的 IXAI：AI Wealth Workspace"
    />
  );
}
