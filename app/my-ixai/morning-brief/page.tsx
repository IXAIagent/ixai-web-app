import { CalendarClock, Newspaper, ShieldCheck, Sparkles } from "lucide-react";

import { WorkspaceMorningBriefV14Card } from "@/components/workspace/workspace-morning-brief-v14-card";
import { WorkspaceProductHero } from "@/components/workspace/product";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/morning-brief",
  description:
    "IXAI Workspace Morning Brief 是登入後的每日完整報告，整理 Portfolio、Risk、FCN、Watchlist 與時間線脈絡。",
  title: "Morning Brief | 我的 IXAI",
});

export default function MyIxaiMorningBriefPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/home", icon: Sparkles, label: "回到首頁", variant: "secondary" },
          ]}
          eyebrow="Daily Report"
          kpis={[
            { description: "完整報告集中在這裡，避免首頁重複大量內容。", icon: Newspaper, label: "Report", value: "完整" },
            { description: "使用者手動產生，避免初始載入時執行重型摘要。", icon: ShieldCheck, label: "Run Mode", value: "手動" },
            { description: "報告整理 Portfolio、Risk、FCN、Watchlist 與時間線。", icon: CalendarClock, label: "Context", value: "每日" },
          ]}
          summary="Morning Brief 是每日完整報告頁。首頁只顯示摘要與入口，完整章節、分享、複製與列印集中在這裡。"
          title="Morning Brief：今天的完整 Workspace 報告。"
        />

        <WorkspaceMorningBriefV14Card autoLoad={false} />
      </section>
    </main>
  );
}
