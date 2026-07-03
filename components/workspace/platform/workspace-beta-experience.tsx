import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Info, ShieldCheck } from "lucide-react";

import { BetaReadinessDashboard } from "@/components/workspace/beta-readiness-dashboard";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";

export function WorkspaceBetaExperience() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/settings", icon: ArrowRight, label: "回到設定", variant: "secondary" },
          ]}
          eyebrow="Settings / About"
          kpis={[
            { description: "Beta 功能主線已完成。", icon: CheckCircle2, label: "Beta Status", value: "可驗證" },
            { description: "仍需 production checklist。", icon: ClipboardList, label: "Verification", value: "待確認" },
            { description: "不啟用交易或建議。", icon: ShieldCheck, label: "Safety", value: "保留" },
            { description: "Feedback template 可用。", icon: Info, label: "Feedback", value: "可用" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                About / Beta
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Beta</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Beta 是關於與驗證資訊，不再放在 Workspace 第一層 navigation。
              </p>
            </>
          }
          summary="Beta 頁整理 invite-only pilot 前的狀態、限制與驗證清單，不新增產品功能、不啟用外部服務。"
          title="Beta：確認目前可驗證的 Workspace 範圍。"
        />

        <WorkspaceProductSection
          action={
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]" href="/my-ixai/settings">
              回到設定
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          }
          description="Beta 放在 Settings / About，說明目前準備狀態與不可做的事。"
          eyebrow="Beta Overview"
          title="Beta 準備狀態"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "V14 Beta 功能主線已完成。", icon: CheckCircle2, label: "功能主線", value: "完成" },
              { description: "仍需正式站人工驗證。", icon: ClipboardList, label: "Production QA", tone: "warning", value: "待確認" },
              { description: "不提供買賣建議、下單或目標價。", icon: ShieldCheck, label: "Compliance", value: "保留" },
            ]}
          />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="完整 checklist 與 feedback template 保留在本頁詳細區。"
          eyebrow="Details"
          title="Beta checklist"
        >
          <BetaReadinessDashboard />
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="beta readiness、release notes、feedback metadata">
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            Beta remains invite-only. This page does not enable broker connection, trading, recommendation, AI model call, scheduler, LINE, Telegram, email, push delivery, billing, schema, RLS, or auth behavior.
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
