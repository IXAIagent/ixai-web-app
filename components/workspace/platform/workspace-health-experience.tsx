import Link from "next/link";
import { ArrowRight, Database, HeartPulse, ShieldCheck, Zap } from "lucide-react";

import { WorkspaceHealthCenter } from "@/components/workspace/workspace-health-center";
import { WorkspaceHealthSummary } from "@/components/workspace/workspace-health-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";

export function WorkspaceHealthExperience() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/settings", icon: ArrowRight, label: "回到設定", variant: "secondary" },
          ]}
          eyebrow="Settings / Advanced"
          kpis={[
            { description: "Workspace 是否可正常使用。", icon: HeartPulse, label: "System Health", value: "檢查中" },
            { description: "資料完整度與可用性。", icon: Database, label: "Data Quality", value: "可檢查" },
            { description: "服務狀態只作為進階資訊。", icon: Zap, label: "Advanced", value: "已收納" },
            { description: "唯讀檢查，不改資料。", icon: ShieldCheck, label: "Safety", value: "Read-only" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                System Health
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">系統狀態</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                這裡只協助確認 Workspace 是否正常，不執行 migration、不改 auth、不寫入資料。
              </p>
            </>
          }
          summary="System Health 已移到 Settings / Advanced。一般使用者不需要在主導航第一層看到 runtime、provider 或 readiness。"
          title="系統狀態：確認 Workspace 是否可安心使用。"
        />

        <WorkspaceProductSection
          action={
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]" href="/my-ixai/settings">
              回到設定
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          }
          description="先看使用者能理解的系統狀態；進階技術資料在下方 Advanced。"
          eyebrow="Health Summary"
          title="目前 Workspace 狀態"
        >
          <WorkspaceHealthSummary />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Health 不再是第一層 navigation，而是 Settings / Advanced 的系統檢查。"
          eyebrow="What this means"
          title="這頁幫你確認什麼"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "Portfolio、FCN、Risk 等核心工作流是否可用。", icon: HeartPulse, label: "Workspace", value: "監控" },
              { description: "資料不足時以清楚狀態顯示。", icon: Database, label: "Data", value: "可理解" },
              { description: "進階檢查不會影響使用者資料。", icon: ShieldCheck, label: "Read-only", value: "安全" },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="health、source、readiness、runtime details">
          <WorkspaceHealthCenter />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
